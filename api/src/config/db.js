import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
// Database Connection

const connectDB = async () => {
  console.log("Attempting to connect to MongoDB...");
  try {
    const conn = await mongoose.connect( process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1); // exit if connection fails
  }
};

export default connectDB;

