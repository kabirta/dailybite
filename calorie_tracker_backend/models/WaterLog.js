const mongoose = require("mongoose");

const waterLogSchema = new mongoose.Schema(
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
    totalWater: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

waterLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WaterLog", waterLogSchema);
