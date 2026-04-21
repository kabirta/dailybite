const { StatusCodes } = require("http-status-codes");
const DailyLog = require("../models/DailyLog");
const Food = require("../models/Food");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { calculateMacrosByQuantity } = require("../utils/macroCalculator");
const { getStartOfDayUTC } = require("../utils/date");

const resolveQuantityInGrams = (food, quantity, quantityUnit = "g") => {
  const normalizedUnit = String(quantityUnit).toLowerCase();

  if (normalizedUnit === "g") {
    return quantity;
  }

  if (normalizedUnit === "kg") {
    return quantity * 1000;
  }

  if (normalizedUnit === "piece") {
    if (!food.pieceWeight || Number(food.pieceWeight) <= 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Food "${food.name}" does not support piece unit. Set pieceWeight in grams first.`
      );
    }

    return quantity * Number(food.pieceWeight);
  }

  throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid quantityUnit. Use g, kg, or piece.");
};

const getOrCreateLog = async (userId, date) => {
  const startDate = getStartOfDayUTC(date);
  const existing = await DailyLog.findOne({ user: userId, date: startDate });
  if (existing) return existing;

  return DailyLog.create({
    user: userId,
    date: startDate,
    meals: [],
  });
};

const addMealToDailyLog = asyncHandler(async (req, res) => {
  const { foodId, quantity, quantityUnit = "g", date } = req.body;
  const logDate = getStartOfDayUTC(date || new Date());

  const food = await Food.findById(foodId).lean();
  if (!food) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Food item not found");
  }

  const quantityInGrams = resolveQuantityInGrams(food, Number(quantity), quantityUnit);
  const macros = calculateMacrosByQuantity(food, quantityInGrams);
  const log = await getOrCreateLog(req.user._id, logDate);

  log.meals.push({
    food: food._id,
    quantity: quantityInGrams,
    ...macros,
  });

  await log.save();
  await log.populate("meals.food", "name brand servingSize");

  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Meal added to daily log",
    data: log,
  });
});

const addMealListToDailyLog = asyncHandler(async (req, res) => {
  const { foods, date } = req.body;
  const logDate = getStartOfDayUTC(date || new Date());

  const requestedFoodIds = foods.map((entry) => entry.foodId);
  const uniqueFoodIds = [...new Set(requestedFoodIds)];

  const dbFoods = await Food.find({ _id: { $in: uniqueFoodIds } }).lean();
  const foodMap = new Map(dbFoods.map((food) => [String(food._id), food]));

  const missingFoodIds = uniqueFoodIds.filter((id) => !foodMap.has(String(id)));
  if (missingFoodIds.length > 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Some food items were not found", {
      missingFoodIds,
    });
  }

  const log = await getOrCreateLog(req.user._id, logDate);

  foods.forEach((entry) => {
    const food = foodMap.get(String(entry.foodId));
    const quantityInGrams = resolveQuantityInGrams(
      food,
      Number(entry.quantity),
      entry.quantityUnit || "g"
    );
    const macros = calculateMacrosByQuantity(food, quantityInGrams);

    log.meals.push({
      food: food._id,
      quantity: quantityInGrams,
      ...macros,
    });
  });

  await log.save();
  await log.populate("meals.food", "name brand servingSize");

  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Meal list added to daily log",
    data: log,
  });
});

const removeMealFromDailyLog = asyncHandler(async (req, res) => {
  const { mealId } = req.params;
  const logDate = getStartOfDayUTC(req.query.date || new Date());

  const log = await DailyLog.findOne({ user: req.user._id, date: logDate });
  if (!log) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No log found for this date");
  }

  const meal = log.meals.id(mealId);
  if (!meal) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Meal not found in daily log");
  }

  meal.deleteOne();
  await log.save();

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Meal removed successfully",
    data: log,
  });
});

const getTodaySummary = asyncHandler(async (req, res) => {
  const today = getStartOfDayUTC(new Date());
  const log = await DailyLog.findOne({ user: req.user._id, date: today })
    .populate("meals.food", "name brand servingSize")
    .lean();

  res.status(StatusCodes.OK).json({
    status: "success",
    data: log || {
      user: req.user._id,
      date: today,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    },
  });
});

const getDateRangeSummary = asyncHandler(async (req, res) => {
  const startDate = getStartOfDayUTC(req.query.startDate);
  const endDate = getStartOfDayUTC(req.query.endDate);

  if (endDate < startDate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "endDate cannot be before startDate");
  }

  const logs = await DailyLog.find({
    user: req.user._id,
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ date: 1 })
    .lean();

  const totals = logs.reduce(
    (acc, log) => {
      acc.totalCalories += log.totalCalories;
      acc.totalProtein += log.totalProtein;
      acc.totalCarbs += log.totalCarbs;
      acc.totalFat += log.totalFat;
      return acc;
    },
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      range: { startDate, endDate },
      days: logs.length,
      totals,
      logs,
    },
  });
});

module.exports = {
  addMealToDailyLog,
  addMealListToDailyLog,
  removeMealFromDailyLog,
  getTodaySummary,
  getDateRangeSummary,
};
