const { StatusCodes } = require("http-status-codes");
const WaterLog = require("../models/WaterLog");
const asyncHandler = require("../utils/asyncHandler");
const { getStartOfDayUTC } = require("../utils/date");

const addWaterIntake = asyncHandler(async (req, res) => {
  const { amount, date } = req.body;
  const logDate = getStartOfDayUTC(date || new Date());

  const log = await WaterLog.findOneAndUpdate(
    { user: req.user._id, date: logDate },
    {
      $inc: { totalWater: Number(amount) },
      $setOnInsert: { user: req.user._id, date: logDate },
    },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Water intake recorded",
    data: log,
  });
});

const getDailyWaterTotal = asyncHandler(async (req, res) => {
  const logDate = getStartOfDayUTC(req.query.date || new Date());
  const log = await WaterLog.findOne({ user: req.user._id, date: logDate }).lean();

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      date: logDate,
      totalWater: log ? log.totalWater : 0,
    },
  });
});

module.exports = { addWaterIntake, getDailyWaterTotal };
