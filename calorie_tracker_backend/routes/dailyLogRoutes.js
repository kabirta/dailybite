const express = require("express");
const {
  addMealToDailyLog,
  addMealListToDailyLog,
  removeMealFromDailyLog,
  getTodaySummary,
  getDateRangeSummary,
} = require("../controllers/dailyLogController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  addMealValidator,
  addMealListValidator,
  removeMealValidator,
  dateRangeValidator,
} = require("../validators/dailyLogValidator");

const router = express.Router();

router.use(protect);

// for single item meal
router.post("/meals", addMealValidator, validate, addMealToDailyLog);
//for multiple item meal
router.post("/meals/bulk", addMealListValidator, validate, addMealListToDailyLog);
router.delete("/meals/:mealId", removeMealValidator, validate, removeMealFromDailyLog);
router.get("/today", getTodaySummary);
router.get("/range", dateRangeValidator, validate, getDateRangeSummary);

module.exports = router;
