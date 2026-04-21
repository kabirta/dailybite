const mongoose = require("mongoose");

const breathTestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inhaleTime: {
      type: Number,
      required: true,
      min: 0,
    },
    exhaleTime: {
      type: Number,
      required: true,
      min: 0,
    },
    targetHoldTime: {
      type: Number,
      required: true,
      min: 0.0010,
      immutable: true,
    },
    actualHoldTime: {
      type: Number,
      required: true,
      min: 0,
    },
    performancePercent: {
      type: Number,
      required: true,
      min: 0,
    },
    result: {
      type: String,
      required: true,
      enum: [
        "Excellent Lung Capacity",
        "Good Lung Capacity",
        "Average Lung Capacity",
        "Needs Improvement",
      ],
    },
  },
  { timestamps: true }
);

breathTestSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("BreathTest", breathTestSchema);
