import { User } from "../module/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const signup = async (req,res)=>{
    try{
        const {name,email,number,user_name,password} = req.body;
        const existingUser = await User.findOne({ $or:[{email},{user_name}]})
        if(existingUser){
            res.status(400)
            .json({
                message :"user  already exist! can you login",
                success:false
            })
        }
        const users = new User({name,email,number,user_name,password})
        users.password=await bcrypt.hash(password,10)
        await users.save()

        const jwtToken = jwt.sign(
            {
                email:users.email,
                _id:users._id,
                user_name:users.user_name,
            },
              process.env.JWT_KEY,
               { expiresIn: '24h' }
        )
        res.cookie("token",jwtToken,{
            httpOnly: true,
            secure: false, // production me true
            maxAge: 24 * 60 * 60 * 1000
        })
      
        
         .json({
                message: "Signup successfully",
                success: true
            })
    }catch(e){
         res.status(201)
            .json({
                message: `Internal server errer ${e}`,
                success: false
            })
    }
}
export const login = async (req,res)=>{
    try{
        const {email,user_name,password} = req.body;
        const existingUser = await User.findOne({ $or:[{email},{user_name}]})
        if(!existingUser){
            res.status(403)
            .json({
                message :"Auth failed email or password in wrong",
                success:false
            })
        }
        // const users = new User({email,number,user_name,password})
        // users.password=await bcrypt.hash(password,10)
        // await users.save()
        const checkPassword = await bcrypt.compare(password,existingUser.password)
        
        if (!checkPassword) {
            return res.status(403).json({
                message: "Password is wrong",
                success: false
            })
        }

        const jwtToken = jwt.sign(
            {
                email:existingUser.email,
                _id:existingUser._id,
                user_name:existingUser  .user_name,
            },
              process.env.JWT_KEY,
               { expiresIn: '24h' }
        )
        res.cookie("token",jwtToken,{
            httpOnly: true,
            secure: false, // production me true
            maxAge: 24 * 60 * 60 * 1000
        })
      
        
         .json({
                message: "login successfully",
                success: true
            })
    }catch(e){
         res.status(201)
            .json({
                message: `Internal server errer ${e}`,
                success: false
            })
    }
}