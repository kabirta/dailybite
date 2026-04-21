const express = require("express");
const { createFood, searchFoods, getFoodById } = require("../controllers/foodController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createFoodValidator,
  foodSearchValidator,
  foodIdValidator,
} = require("../validators/foodValidator");

const router = express.Router();

router.get("/", foodSearchValidator, validate, searchFoods);
router.get("/:foodId", foodIdValidator, validate, getFoodById);
router.post("/", protect, createFoodValidator, validate, createFood);

module.exports = router;
