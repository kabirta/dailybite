const { body, query, param } = require("express-validator");

const createFoodValidator = [
  body("name").trim().notEmpty().withMessage("Food name is required"),
  body("brand").optional().trim(),
  body("calories").isFloat({ min: 0 }).withMessage("Calories must be a positive number"),
  body("protein").isFloat({ min: 0 }).withMessage("Protein must be a positive number"),
  body("carbs").isFloat({ min: 0 }).withMessage("Carbs must be a positive number"),
  body("fat").isFloat({ min: 0 }).withMessage("Fat must be a positive number"),
  body("fiber").optional().isFloat({ min: 0 }).withMessage("Fiber must be a positive number"),
  body("servingSize")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Serving size must be greater than 0"),
  body("pieceWeight")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("pieceWeight must be greater than 0"),
  body("isVerified").optional().isBoolean().withMessage("isVerified must be true or false"),
];

const foodSearchValidator = [
  query("q").optional().isString().withMessage("Search query must be a string"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
];

const foodIdValidator = [param("foodId").isMongoId().withMessage("Invalid food id")];

module.exports = { createFoodValidator, foodSearchValidator, foodIdValidator };
