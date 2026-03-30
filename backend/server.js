import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./db/db.js"


dotenv.config()
connectDB()

const app = express()
const port =process.env.PORT

app.get("/",(req,res)=>{
    res.send("hello server ")
})
app.get ("/j",(req,res)=>{
    res.json({
        name:"hello server"
    })
})
app.listen(port,()=>{
    console.log(`server runing  http://localhost:${port}`);
    
})
