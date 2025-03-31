import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from './DB/connectDB.js'
dotenv.config({
    path:"./.env"
})

connectDB().
then(
   app.listen(process.env.PORT || 8001,()=>{
    console.log("app listning on port : ",process.env.PORT)
   })
    
).catch((err)=>{
    console.log("connection error : ".err);
}
)



