const { body, param, query } = require("express-validator");

const normalizeQuantityUnit = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().toLowerCase();
};

const addMealValidator = [
  body("foodId").isMongoId().withMessage("Valid foodId is required"),
  body("quantity").isFloat({ gt: 0 }).withMessage("Quantity must be a positive number"),
  body("quantityUnit")
    .optional()
    .customSanitizer(normalizeQuantityUnit)
    .isIn(["g", "kg", "piece"])
    .withMessage("quantityUnit must be one of: g, kg, piece"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO date string"),
];

const addMealListValidator = [
  body("foods").isArray({ min: 1 }).withMessage("foods must be a non-empty array"),
  body("foods.*.foodId").isMongoId().withMessage("Each food item must include a valid foodId"),
  body("foods.*.quantity")
    .isFloat({ gt: 0 })
    .withMessage("Each food item quantity must be a positive number"),
  body("foods.*.quantityUnit")
    .optional()
    .customSanitizer(normalizeQuantityUnit)
    .isIn(["g", "kg", "piece"])
    .withMessage("Each food item quantityUnit must be one of: g, kg, piece"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO date string"),
];

const removeMealValidator = [
  param("mealId").isMongoId().withMessage("Invalid meal id"),
  query("date").optional().isISO8601().withMessage("Date must be a valid ISO date string"),
];

const dateRangeValidator = [
  query("startDate").isISO8601().withMessage("startDate must be a valid date"),
  query("endDate").isISO8601().withMessage("endDate must be a valid date"),
];

module.exports = { addMealValidator, addMealListValidator, removeMealValidator, dateRangeValidator };
