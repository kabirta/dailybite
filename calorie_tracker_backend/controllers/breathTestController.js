const { StatusCodes } = require("http-status-codes");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const BreathTest = require("../models/BreathTest");

const createBreathTestResult = asyncHandler(async (req, res) => {
  const inhaleTime = Number(req.body.inhaleTime);
  const exhaleTime = Number(req.body.exhaleTime);
  const targetHoldTime = env.BREATH_TEST_TARGET_HOLD_TIME;
  const actualHoldTime = Number(req.body.actualHoldTime);

  const performancePercent = (actualHoldTime / targetHoldTime) * 100;

  let result = "Needs Improvement";
  if (performancePercent >= 90) {
    result = "Excellent Lung Capacity";
  } else if (performancePercent >= 70) {
    result = "Good Lung Capacity";
  } else if (performancePercent >= 50) {
    result = "Average Lung Capacity";
  }

  const record = await BreathTest.create({
    user: req.user._id,
    inhaleTime,
    exhaleTime,
    targetHoldTime,
    actualHoldTime,
    performancePercent: Number(performancePercent.toFixed(2)),
    result,
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Breath test result saved",
    data: record,
  });
});

const getBreathTestHistory = asyncHandler(async (req, res) => {
  const records = await BreathTest.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

  res.status(StatusCodes.OK).json({
    status: "success",
    data: records,
  });
});

module.exports = { createBreathTestResult, getBreathTestHistory };
