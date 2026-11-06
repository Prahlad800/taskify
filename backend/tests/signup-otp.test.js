import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {MongoMemoryServer} from 'mongodb-memory-server-core';
import {User} from '../module/user.js';
import {SignupOtp} from '../module/signup_otp.js';
import {createSignupService} from '../services/signup_otp.js';
import {mailConfiguration} from '../services/signup_mail.js';

process.env.JWT_KEY='test-only-signing-key-not-a-real-credential';
process.env.OTP_SECRET='test-only-otp-key';
const details={name:'Test Person',email:'otp.test@example.com',user_name:'otp_tester',number:'9999999999',password:'Testing123!'};
test('signup email verification lifecycle',async t=>{
 const mongo=await MongoMemoryServer.create({binary:{version:"7.0.14"}});
 try{await mongoose.connect(mongo.getUri(),{dbName:'taskify_otp_tests'});await Promise.all([User.init(),SignupOtp.init()]);
 let clock=new Date();let delivered=[];
 const service=createSignupService({assertMail:()=>{},now:()=>clock,sendMail:async message=>delivered.push(message)});
 const advance=seconds=>clock=new Date(clock.getTime()+seconds*1000);
 const clean=async()=>{await Promise.all([User.deleteMany({}),SignupOtp.deleteMany({})]);delivered=[];};
 await t.test('no account before verification; hashed secrets; verify once',async()=>{
  await clean();const session=await service.request({...details,email:'OTP.Test@example.com'});assert.equal(session.email,details.email);assert.equal(await User.countDocuments(),0);assert.equal(session.otp,undefined);assert.equal(session.jwtToken,undefined);
  const pending=await SignupOtp.findOne();assert.notEqual(pending.otpHash,delivered[0].code);assert.notEqual(pending.passwordHash,details.password);assert.equal(pending.password,undefined);assert.equal(await bcrypt.compare(details.password,pending.passwordHash),true);
  const user=await service.verify({...session,otp:delivered[0].code});assert.ok(user.emailVerifiedAt);assert.equal(await User.countDocuments(),1);assert.equal(await SignupOtp.countDocuments(),0);assert.equal(await bcrypt.compare(details.password,user.password),true);
  await assert.rejects(()=>service.verify({...session,otp:delivered[0].code}),{status:400});
 });
 await t.test('incorrect code does not create account; five attempts lock the challenge',async()=>{
  await clean();const session=await service.request(details);const code=delivered[0].code;const wrong=code==='111111'?'222222':'111111';
  for(let n=0;n<5;n++)await assert.rejects(()=>service.verify({...session,otp:wrong}),{status:400});
  await assert.rejects(()=>service.verify({...session,otp:code}),{status:400});assert.equal(await User.countDocuments(),0);
 });
 await t.test('expiry is enforced without waiting for Mongo TTL cleanup',async()=>{
  await clean();const session=await service.request(details);advance(601);await assert.rejects(()=>service.verify({...session,otp:delivered[0].code}),{status:400});assert.equal(await User.countDocuments(),0);
 });
 await t.test('resend cooldown and stale-code rejection; challenge survives service restart',async()=>{
  await clean();const first=await service.request(details);const oldCode=delivered[0].code;
  await assert.rejects(()=>service.resend(first),{status:429});advance(61);const second=await service.resend(first);assert.notEqual(first.challengeId,second.challengeId);
  await assert.rejects(()=>service.verify({...first,otp:oldCode}),{status:400});
  const restarted=createSignupService({now:()=>clock});await restarted.verify({...second,otp:delivered[1].code});assert.equal(await User.countDocuments(),1);
 });
 await t.test('simultaneous verification creates exactly one account',async()=>{
  await clean();const session=await service.request(details);const results=await Promise.allSettled([service.verify({...session,otp:delivered[0].code}),service.verify({...session,otp:delivered[0].code})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(await User.countDocuments(),1);
 });
 await t.test('parallel requests cannot bypass send cooldown',async()=>{
  await clean();const results=await Promise.allSettled([service.request(details),service.request(details)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(delivered.length,1);
 });
 await t.test('failed mail never reports success or leaves usable OTP/account',async()=>{
  await clean();const broken=createSignupService({assertMail:()=>{},sendMail:async()=>{throw Error('smtp failed')}});await assert.rejects(()=>broken.request(details),{status:503});assert.equal(await User.countDocuments(),0);assert.equal(await SignupOtp.countDocuments(),0);
 });
 await t.test('existing email or username cannot be signed up again',async()=>{
  await clean();await User.create({...details,password:await bcrypt.hash(details.password,10)});await assert.rejects(()=>service.request({...details,email:'OTP.TEST@example.com'}),{status:409});await assert.rejects(()=>service.request({...details,email:'another@example.com'}),{status:409});assert.equal(delivered.length,0);
 });
 await t.test('email regex matches literal dots instead of another address',async()=>{
  await clean();await User.create({...details,email:'otpXtest@example.com',user_name:'other_user',password:'hashed'});const session=await service.request(details);assert.equal(session.email,details.email);
 });
 await t.test('SMTP credentials are required and TLS stays enabled',async()=>{
  delete process.env.SMTP_HOST;await assert.rejects(async()=>mailConfiguration(),{status:503});
  Object.assign(process.env,{SMTP_HOST:'smtp.gmail.com',SMTP_PORT:'465',SMTP_USER:'sender@example.com',SMTP_PASS:'test-only',SMTP_FROM:'sender@example.com'});assert.equal(mailConfiguration().secure,true);process.env.SMTP_PORT='587';assert.equal(mailConfiguration().requireTLS,true);
 });
 }finally{await mongoose.disconnect();await mongo.stop();}
});
