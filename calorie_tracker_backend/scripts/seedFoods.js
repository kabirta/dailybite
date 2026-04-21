const mongoose = require("mongoose");
const connectDB = require("../config/db");
const env = require("../config/env");
const Food = require("../models/Food");
const User = require("../models/User");

const foodSeed = [
  {
    name: "Chicken Breast",
    brand: "Generic",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    servingSize: 100,
    isVerified: true,
  },
  {
    name: "Brown Rice",
    brand: "Generic",
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    servingSize: 100,
    isVerified: true,
  },
  {
    name: "Banana",
    brand: "Generic",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    servingSize: 100,
    isVerified: true,
  },
];

const seedFoods = async () => {
  try {
    await connectDB(env.MONGO_URI);

    let admin = await User.findOne({ email: "seed-admin@example.com" });
    if (!admin) {
      admin = await User.create({
        name: "Seed Admin",
        email: "seed-admin@example.com",
        password: "seedadmin123",
        role: "admin",
      });
    }

    await Food.deleteMany({});
    const docs = foodSeed.map((item) => ({ ...item, createdBy: admin._id }));
    await Food.insertMany(docs);

    console.log(`Seed completed. Inserted ${docs.length} foods.`);
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seedFoods();
