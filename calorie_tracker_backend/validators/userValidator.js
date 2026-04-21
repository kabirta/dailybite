const { body } = require("express-validator");

const updateProfileValidator = [
  body("age").optional().isInt({ min: 1, max: 120 }).withMessage("Age must be between 1 and 120"),
  body("gender").optional().isIn(["male", "female", "other"]).withMessage("Invalid gender"),
  body("height").optional().isFloat({ min: 30, max: 300 }).withMessage("Height must be in cm"),
  body("weight").optional().isFloat({ min: 20, max: 500 }).withMessage("Weight must be in kg"),
  body("goal")
    .optional()
    .isIn(["weight_loss", "weight_gain", "maintenance"])
    .withMessage("Invalid goal value"),
];

const calorieTargetValidator = [
  body("dailyCalorieTarget")
    .isInt({ min: 800, max: 10000 })
    .withMessage("Daily calorie target must be between 800 and 10000"),
];

const setTargetsValidator = [
  body("targetWeight")
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage("Target weight must be between 20 and 500 kg"),
  body("dailyWaterTarget")
    .optional()
    .isInt({ min: 500, max: 10000 })
    .withMessage("Daily water target must be between 500 and 10000 ml"),
  body("dailyCalorieTarget")
    .optional()
    .isInt({ min: 800, max: 10000 })
    .withMessage("Daily calorie target must be between 800 and 10000"),
  body()
    .custom((value) => {
      const hasAnyTarget =
        value.targetWeight !== undefined ||
        value.dailyWaterTarget !== undefined ||
        value.dailyCalorieTarget !== undefined;
      return hasAnyTarget;
    })
    .withMessage(
      "Provide at least one target field: targetWeight, dailyWaterTarget, or dailyCalorieTarget"
    ),
];

module.exports = { updateProfileValidator, calorieTargetValidator, setTargetsValidator };
