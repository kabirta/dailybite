const mongoose = require("mongoose");

let connectPromise = null;

const connectDB = async (uri) => {
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectPromise) {
    return connectPromise;
  }

  mongoose.set("strictQuery", true);
  connectPromise = mongoose
    .connect(uri, {
      autoIndex: true,
    })
    .then(() => {
      console.log("MongoDB connected");
      return mongoose.connection;
    })
    .catch((error) => {
      connectPromise = null;
      throw error;
    });

  return connectPromise;
};

module.exports = connectDB;
