const express = require("express");
const multer = require("multer");
const { StatusCodes } = require("http-status-codes");
const {
  upload,
  createRecipe,
  listRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");
const { protect } = require("../middleware/auth");
const ApiError = require("../utils/apiError");
const validate = require("../middleware/validate");
const { createRecipeValidator, updateRecipeValidator, recipeIdValidator } = require("../validators/recipeValidator");

const router = express.Router();

const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      next(new ApiError(StatusCodes.BAD_REQUEST, "Image must be 5MB or smaller"));
      return;
    }

    next(err);
  });
};

router.use(protect);

router.post("/", uploadSingleImage, createRecipeValidator, validate, createRecipe);
router.get("/", listRecipes);
router.get("/:recipeId", recipeIdValidator, validate, getRecipeById);
router.patch("/:recipeId", uploadSingleImage, updateRecipeValidator, validate, updateRecipe);
router.delete("/:recipeId", recipeIdValidator, validate, deleteRecipe);

module.exports = router;
