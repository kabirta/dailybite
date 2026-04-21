const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "water", "snack_other", "workout"],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    // HH:mm format in 24-hour clock.
    time: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    // 0 = Sunday, 6 = Saturday.
    days: {
      type: [Number],
      required: true,
      validate: {
        validator(value) {
          if (!Array.isArray(value) || value.length === 0) return false;
          const uniqueDays = new Set(value);
          return [...uniqueDays].every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
        },
        message: "days must contain unique weekday numbers between 0 and 6",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

reminderSchema.index({ user: 1, type: 1, time: 1, days: 1 });
reminderSchema.index({ user: 1, isActive: 1, type: 1 });

module.exports = mongoose.model("Reminder", reminderSchema);
