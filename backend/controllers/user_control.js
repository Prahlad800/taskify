import { User } from "../module/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const login = async (req, res) => {
    try {
        const { email, user_name, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { user_name }] })
        if (!existingUser) {
            return res.status(403)
                .json({
                    message: "Auth failed email or password in wrong",
                    success: false
                })
        }
        // const users = new User({email,number,user_name,password})
        // users.password=await bcrypt.hash(password,10)
        // await users.save()
        const checkPassword = await bcrypt.compare(password, existingUser.password)

        if (!checkPassword) {
            return res.status(403).json({
                message: "Password is wrong",
                success: false
            })
        }

        const jwtToken = jwt.sign(
            {
                email: existingUser.email,
                _id: existingUser._id,
                user_name: existingUser.user_name,
            },
            process.env.JWT_KEY,
            { expiresIn: '24h' }
        )
        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        })


            .json({
                
                success: true,
                message: "login successfully",
                jwtToken,
                users: {
                    name: existingUser.name,
                    email: existingUser.email,
                    user_name:existingUser.user_name
                }
            })
    } catch (e) {
        res.status(500)
            .json({
                message: `Internal server errer ${e}`,
                success: false
            })
    }
}
