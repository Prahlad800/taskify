import mongoose from "mongoose";

const useSchema = mongoose.Schema({
    name: {
        type: String,
        requrid: true
    },
    email: {
        type: String,
        requrid: true,
        unique: true,
    },
    user_name: {
        type: String,
        requrid: true,
        unique: true,
    },
    number: {
        
        url: String,
        public_id: String,
    },
    avtar: {
        type: String,
    },
    password: {
        type: String,
        requrid: true
    }

},
    {
        timestamp: true,
    }
)

export const User = mongoose.model("User", useSchema)