const mongoose = require("mongoose");
const { calculateDailyTotals } = require("../utils/macroCalculator");

const mealSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
    },
    fat: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const dailyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    meals: [mealSchema],
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
    },
    totalFat: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

dailyLogSchema.pre("save", function dailyLogPreSave(next) {
  const totals = calculateDailyTotals(this.meals);
  this.totalCalories = totals.totalCalories;
  this.totalProtein = totals.totalProtein;
  this.totalCarbs = totals.totalCarbs;
  this.totalFat = totals.totalFat;
  next();
});

module.exports = mongoose.model("DailyLog", dailyLogSchema);
