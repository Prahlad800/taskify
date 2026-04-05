import mongoose from "mongoose";
export const connectDB=()=>{
    const url =process.env.MONG_URI
    mongoose.connect(url)
    .then(()=>{
        console.log("mongoose connect is successfully!")
    })
    .catch((e)=>{
        console.log("mongoose connect error!",e)
    })
}