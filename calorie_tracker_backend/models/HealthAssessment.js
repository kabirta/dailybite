const mongoose = require("mongoose");

const healthAssessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    hereTo: {
      type: String,
      enum: ["lose_weight", "maintain_weight", "work_that_out"],
      required: true,
    },
    mainHealthGoal: {
      type: String,
      enum: [
        "understand_food_intake",
        "manage_medical_condition",
        "improve_overall_health",
        "improve_emotional_wellbeing",
        "other",
      ],
      required: true,
    },
    healthGoalOption: {
      type: Number,
      min: 1,
      max: 4,
      required: true,
    },
    heightUnit: {
      type: String,
      enum: ["cm", "ft_in"],
      required: true,
    },
    heightCm: {
      type: Number,
      min: 30,
      max: 300,
      required: true,
    },
    currentWeightKg: {
      type: Number,
      min: 20,
      max: 500,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    age: {
      type: Number,
      min: 1,
      max: 120,
      required: true,
    },
    weightGoalKg: {
      type: Number,
      min: 20,
      max: 500,
      required: true,
    },
    sex: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthAssessment", healthAssessmentSchema);
