const { body, query } = require("express-validator");

const addWaterValidator = [
  body("amount").isFloat({ min: 1 }).withMessage("Water amount must be > 0 (ml)"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO date string"),
];

const waterDateValidator = [query("date").optional().isISO8601().withMessage("Date must be valid")];

module.exports = { addWaterValidator, waterDateValidator };
