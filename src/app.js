import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
// import { signIn } from './controller/user.controller.js'
import authRoute from './router/auth.routes.js'
import userRoute from './router/user.routes.js'
import repoRoute from './router/repo.routes.js'
import postRoute from './router/post.routes.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
dotenv.config()
const app = express()
app.use(cors({
    // origin:  "http://localhost:5173",
    origin:  process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())


// app.use('/user',)
app.use('/auth',authRoute)
app.use('/user',authMiddleware,userRoute)
app.use('/repo',authMiddleware,repoRoute)
app.use('/post',postRoute)
// app.use('/post',postRoute)

export {app}