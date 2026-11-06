import dotenv from 'dotenv';
import {connectDB} from './db/db.js';
import {createApplication} from './app.js';
dotenv.config();
try{await connectDB();const {server}=createApplication();server.listen(process.env.PORT||3030,()=>console.log('server running http://localhost:'+(process.env.PORT||3030)));}
catch(error){console.error('Backend startup failed:',error.code||error.name);process.exitCode=1;}
