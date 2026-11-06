import mongoose from 'mongoose';
export async function connectDB(){await mongoose.connect(process.env.MONG_URI,{serverSelectionTimeoutMS:15000});console.log('mongoose connect is successfully!');}
