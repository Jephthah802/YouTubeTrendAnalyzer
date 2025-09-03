import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Database Connection and Server Startup
const connect = async () => {
  console.log("Attempting to connect to MongoDB....")
try {
  const conn = await mongoose.connect(`${process.env.MONGODB_URI}/YoutubeTrendAnalyzer` )
  console.log(`MongoDB connected: ${conn.connection.host}`);
} catch (error) {
  console.log("Failed to connect to MongoDB....",error.message)
}
};

export default connect;