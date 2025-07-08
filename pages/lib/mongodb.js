import mongoose from "mongoose";

const connectMongo = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("✅ Already connected to Mongo");
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("❌ MONGO_URI environment variable not set.");
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");
};

export default connectMongo;
