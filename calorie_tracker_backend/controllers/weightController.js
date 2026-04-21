const { StatusCodes } = require("http-status-codes");
const WeightLog = require("../models/WeightLog");
const asyncHandler = require("../utils/asyncHandler");

const addWeightLog = asyncHandler(async (req, res) => {
  const { weight, date } = req.body;
  const weightLog = await WeightLog.create({
    user: req.user._id,
    weight,
    date: date || new Date(),
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Weight log added",
    data: weightLog,
  });
});

const getWeightHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = {};

  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }
  if (endDate) {
    dateFilter.$lte = new Date(endDate);
  }

  const query = { user: req.user._id };
  if (Object.keys(dateFilter).length > 0) {
    query.date = dateFilter;
  }

  const logs = await WeightLog.find(query).sort({ date: -1 }).lean();

  res.status(StatusCodes.OK).json({
    status: "success",
    data: logs,
  });
});

module.exports = { addWeightLog, getWeightHistory };
