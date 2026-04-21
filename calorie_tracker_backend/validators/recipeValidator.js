const { body, param } = require("express-validator");

const parseStringArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : value;
  } catch (error) {
    return value;
  }
};

const ingredientItemValidator = (path) =>
  body(path)
    .isString()
    .withMessage("Each ingredient must be a string")
    .trim()
    .notEmpty()
    .withMessage("Ingredient cannot be empty")
    .isLength({ max: 200 })
    .withMessage("Ingredient cannot exceed 200 characters");

const directionItemValidator = (path) =>
  body(path)
    .isString()
    .withMessage("Each direction must be a string")
    .trim()
    .notEmpty()
    .withMessage("Direction cannot be empty")
    .isLength({ max: 1000 })
    .withMessage("Direction cannot exceed 1000 characters");

const createRecipeValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required")
    .isLength({ max: 120 })
    .withMessage("title cannot exceed 120 characters"),
  body("ingredients")
    .customSanitizer(parseStringArray)
    .isArray({ min: 1 })
    .withMessage("ingredients must be an array with at least one item"),
  ingredientItemValidator("ingredients.*"),
  body("directions")
    .customSanitizer(parseStringArray)
    .isArray({ min: 1 })
    .withMessage("directions must be an array with at least one item"),
  directionItemValidator("directions.*"),
  body("serves").isInt({ min: 1, max: 100 }).withMessage("serves must be between 1 and 100"),
  body("prepTime").isFloat({ min: 0 }).withMessage("prepTime must be a non-negative number"),
  body("cookTime").isFloat({ min: 0 }).withMessage("cookTime must be a non-negative number"),
];

const updateRecipeValidator = [
  param("recipeId").isMongoId().withMessage("Invalid recipe id"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("title cannot be empty")
    .isLength({ max: 120 })
    .withMessage("title cannot exceed 120 characters"),
  body("ingredients")
    .optional()
    .customSanitizer(parseStringArray)
    .isArray({ min: 1 })
    .withMessage("ingredients must be an array with at least one item"),
  ingredientItemValidator("ingredients.*").optional(),
  body("directions")
    .optional()
    .customSanitizer(parseStringArray)
    .isArray({ min: 1 })
    .withMessage("directions must be an array with at least one item"),
  directionItemValidator("directions.*").optional(),
  body("serves")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("serves must be between 1 and 100"),
  body("prepTime")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("prepTime must be a non-negative number"),
  body("cookTime")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("cookTime must be a non-negative number"),
];

const recipeIdValidator = [param("recipeId").isMongoId().withMessage("Invalid recipe id")];

module.exports = { createRecipeValidator, updateRecipeValidator, recipeIdValidator };
