const express = require("express");
const { getMe, updateProfile, setCalorieGoal, setTargets } = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  updateProfileValidator,
  calorieTargetValidator,
  setTargetsValidator,
} = require("../validators/userValidator");

const router = express.Router();

router.use(protect);

router.get("/me", getMe);
router.patch("/profile", updateProfileValidator, validate, updateProfile);
router.patch("/calorie-goal", calorieTargetValidator, validate, setCalorieGoal);
router.patch("/targets", setTargetsValidator, validate, setTargets);

module.exports = router;
