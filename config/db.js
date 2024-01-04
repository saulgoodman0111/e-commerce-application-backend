import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Sucessfully connected to MongoDB!!! ${mongoose.connection.host}`.bgYellow.black);
  } catch (error) {
    console.log(`MongoDB connection failed!!! ${error}`.bgRed.white);
  }
};

export default connectDB;
