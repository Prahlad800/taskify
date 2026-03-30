import mongoose from "mongoose";

const useSchema = mongoose.Schema({
        name:{
            type:String,
            requrid:true
        },
        email:{
            type:String,
            requrid:true,
            unique: true,
        },
        user_name:{
            type:String,
            requrid:true,
            unique: true,
        },
        number:{
            type:String,
        },
        avtar:{
            type:String,
        },
        password:{
            type:String,
            requrid:true
        }

    },
    {
        timestamp: true,
    }
)

export const User = mongoose.model("User",useSchema)