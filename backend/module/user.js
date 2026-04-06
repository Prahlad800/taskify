import mongoose from "mongoose";

const useSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    user_name: {
        type: String,
        required: true,
        // unique: true,
    },
    number: {
        
       type:String,
    },
    avtar: {
        type: String,
    },
    password: {
        type: String,
        required: true
    }

},
    {
        timestamps: true,
    }
)

export const User = mongoose.model("User", useSchema)