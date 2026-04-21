const { StatusCodes } = require("http-status-codes");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const env = require("../config/env");
const Recipe = require("../models/Recipe");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new ApiError(StatusCodes.BAD_REQUEST, "Only image files are allowed"));
  },
});

const uploadRecipeImage = async (file) => {
  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const uploadResult = await cloudinary.uploader.upload(base64Image, {
    folder: env.CLOUDINARY_RECIPE_FOLDER,
    resource_type: "auto",
  });

  return {
    imageUrl: uploadResult.secure_url,
    imagePublicId: uploadResult.public_id,
  };
};

const createRecipe = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Recipe image file is required");
  }

  const { imageUrl, imagePublicId } = await uploadRecipeImage(req.file);

  const recipe = await Recipe.create({
    user: req.user._id,
    title: req.body.title,
    ingredients: req.body.ingredients.map((item) => item.trim()),
    directions: req.body.directions.map((item) => item.trim()),
    serves: req.body.serves,
    prepTime: req.body.prepTime,
    cookTime: req.body.cookTime,
    imageUrl,
    imagePublicId,
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Recipe created successfully",
    data: recipe,
  });
});

const listRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

  res.status(StatusCodes.OK).json({
    status: "success",
    data: recipes,
  });
});

const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne({
    _id: req.params.recipeId,
    user: req.user._id,
  }).lean();

  if (!recipe) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Recipe not found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: recipe,
  });
});

const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne({ _id: req.params.recipeId, user: req.user._id });
  if (!recipe) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Recipe not found");
  }

  const allowedFields = ["title", "ingredients", "directions", "serves", "prepTime", "cookTime"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "ingredients" || field === "directions") {
        recipe[field] = req.body[field].map((item) => item.trim());
      } else {
        recipe[field] = req.body[field];
      }
    }
  });

  if (req.file) {
    const { imageUrl, imagePublicId } = await uploadRecipeImage(req.file);

    if (recipe.imagePublicId) {
      await cloudinary.uploader.destroy(recipe.imagePublicId);
    }

    recipe.imageUrl = imageUrl;
    recipe.imagePublicId = imagePublicId;
  }

  await recipe.save();

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Recipe updated successfully",
    data: recipe,
  });
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const deleted = await Recipe.findOneAndDelete({
    _id: req.params.recipeId,
    user: req.user._id,
  });

  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Recipe not found");
  }

  if (deleted.imagePublicId) {
    await cloudinary.uploader.destroy(deleted.imagePublicId);
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Recipe deleted successfully",
  });
});

module.exports = { upload, createRecipe, listRecipes, getRecipeById, updateRecipe, deleteRecipe };
