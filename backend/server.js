import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./db/db.js"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import userRouter from "./router/user_router.js"
import notesRouter from "./router/notes_router.js"
import taskRouter from "./router/task_router.js"
import cors from "cors"


dotenv.config()
connectDB()

const app = express()
const port =process.env.PORT

// app.use(bodyParser.json())
// app.use(cors({
//   origin: "https://taskify-gcxc.onrender.com " || "localhost:3000" //http://localhost:5173/
 
// }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://taskify-notes-task.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.get ("/j",(req,res)=>{
    res.json({
        name:"hello server"
    })
})
app.get("/",(req,res)=>{
    res.send("hello server ")
})
app.use("/user",userRouter)
app.use("/home",notesRouter)
app.use("/task",taskRouter)



app.listen(port,()=>{
    console.log(`server runing  http://localhost:${port}`);
    
})
