const { body, query } = require("express-validator");

const addWeightValidator = [
  body("weight").isFloat({ min: 20, max: 500 }).withMessage("Weight must be between 20 and 500 kg"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO date string"),
];

const weightHistoryValidator = [
  query("startDate").optional().isISO8601().withMessage("startDate must be valid date"),
  query("endDate").optional().isISO8601().withMessage("endDate must be valid date"),
];

module.exports = { addWeightValidator, weightHistoryValidator };
