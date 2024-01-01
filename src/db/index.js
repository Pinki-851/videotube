import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export async function connectDB() {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    console.log("connection enstablish", connection.connection.host);
  } catch (error) {
    console.log("monodb connection error", error);
    throw error;
  }
}
