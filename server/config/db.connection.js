import mongoose from 'mongoose'

const connectToDB = async () => {
    try {
     const conn = await mongoose.connect(process.env.MONGODB_URI)
     if(conn){
        console.log("Database connected")
     }
    }
    catch(err){
        console.log("Error message:", err)
    }
}

export default connectToDB;