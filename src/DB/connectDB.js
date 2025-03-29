import mongoose from "mongoose";

const connectDB = async () => {
    try {
       const connection  =   await mongoose.connect(`${process.env.MONGO_DB_URI}/DevCollabDB`)
    //    console.log(connection);
       
    } catch (error) {
        console.log("ERROR in ConnectDB : ", error);
        process.exit(1)
    }
}
 export default connectDB