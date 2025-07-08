// In D:\online-departmental-tests-app\frontend\lib\mongodb.js
import mongoose from "mongoose";

const connectMongo = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("✅ Already connected to Mongo");
    return;
  }

  await mongoose.connect(process.env.MONGO_URI, {
    // These lines should be removed or commented out:
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });

  console.log("✅ Connected to MongoDB");
};

export default connectMongo;