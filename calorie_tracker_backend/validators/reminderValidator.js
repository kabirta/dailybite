const { body, param } = require("express-validator");

const REMINDER_TYPES = ["breakfast", "lunch", "dinner", "water", "snack_other", "workout"];

const normalizeReminderType = (value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  if (normalized === "snack/others") return "snack_other";
  return normalized;
};

const reminderTypeValidator = body("type")
  .customSanitizer(normalizeReminderType)
  .isIn(REMINDER_TYPES)
  .withMessage("type must be breakfast, lunch, dinner, water, snack/others, or workout");

const daysValidator = body("days")
  .isArray({ min: 1, max: 7 })
  .withMessage("days must be an array with at least one weekday")
  .custom((days) => {
    const uniqueDays = new Set(days);
    if (uniqueDays.size !== days.length) return false;
    return days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
  })
  .withMessage("days must contain unique integers from 0 (Sunday) to 6 (Saturday)");

const createReminderValidator = [
  reminderTypeValidator,
  body("message")
    .trim()
    .notEmpty()
    .withMessage("message is required")
    .isLength({ max: 200 })
    .withMessage("message cannot exceed 200 characters"),
  body("time")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("time must be in HH:mm format"),
  daysValidator,
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

const updateReminderValidator = [
  param("reminderId").isMongoId().withMessage("Invalid reminder id"),
  body("type").optional().customSanitizer(normalizeReminderType).isIn(REMINDER_TYPES),
  body("message").optional().trim().notEmpty().withMessage("message cannot be empty"),
  body("time")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("time must be in HH:mm format"),
  body("days").optional(),
  body("days")
    .optional()
    .isArray({ min: 1, max: 7 })
    .withMessage("days must be an array"),
  body("days")
    .optional()
    .custom((days) => {
      const uniqueDays = new Set(days);
      if (uniqueDays.size !== days.length) return false;
      return days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
    })
    .withMessage("days must contain unique integers from 0 to 6"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

const reminderIdValidator = [param("reminderId").isMongoId().withMessage("Invalid reminder id")];

const toggleReminderValidator = [
  param("reminderId").isMongoId().withMessage("Invalid reminder id"),
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
];

module.exports = {
  REMINDER_TYPES,
  createReminderValidator,
  updateReminderValidator,
  reminderIdValidator,
  toggleReminderValidator,
};
