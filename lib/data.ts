import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
    } else {
      throw new Error("MONGODB_URI is not defined");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } 

  const connectionstatus = mongoose.connection.readyState;
  if (connectionstatus === 1) {
  }
  if (connectionstatus === 0) {
  }
  if (connectionstatus === 2) {
  }
};

export default connect;
