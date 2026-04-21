const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    age: {
      type: Number,
      min: 1,
      max: 120,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    height: {
      type: Number,
      min: 30,
      max: 300,
    },
    weight: {
      type: Number,
      min: 20,
      max: 500,
    },
    targetWeight: {
      type: Number,
      min: 20,
      max: 500,
    },
    goal: {
      type: String,
      enum: ["weight_loss", "weight_gain", "maintenance"],
      default: "maintenance",
    },
    dailyCalorieTarget: {
      type: Number,
      min: 800,
      max: 10000,
    },
    dailyWaterTarget: {
      type: Number,
      min: 500,
      max: 10000,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function userPreSave(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
