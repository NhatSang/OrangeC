import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
  } catch (error) {
    console.log("Error connectting ...", error.message);
  }
};

export default connectDB;
