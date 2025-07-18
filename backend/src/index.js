import express from 'express';
import authRoutes from "./routes/auth.route.js"
import dotenv from "dotenv"
import { connectDB } from './lib/db.js';
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.routes.js"
import groupRoutes from "./routes/group.routes.js"
import { authLimiter, messageLimiter} from './lib/rateLimiters.js';
import cors from "cors";
import {app,server,io} from './lib/socket.js'
import path from "path";

dotenv.config()

const PORT=process.env.PORT
const __dirname = path.resolve()

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))

app.use("/api/auth", authLimiter, authRoutes) 
app.use("/api/messages", messageRoutes)
app.use("/api/messages/send", messageLimiter)
app.use("/api/groups", groupRoutes)

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));


  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
  })
}

server.listen(PORT,()=>{
    console.log('Server is running', PORT)
    connectDB()
})