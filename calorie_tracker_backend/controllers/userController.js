const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshTokenHash").lean();
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User profile not found");
  }

  res.status(StatusCodes.OK).json({ status: "success", data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  const allowedFields = ["age", "gender", "height", "weight", "goal", "name"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  })
    .select("-password -refreshTokenHash")
    .lean();

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Profile updated successfully",
    data: user,
  });
});

const setCalorieGoal = asyncHandler(async (req, res) => {
  const { dailyCalorieTarget } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { dailyCalorieTarget },
    { new: true, runValidators: true }
  )
    .select("-password -refreshTokenHash")
    .lean();

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Daily calorie target updated",
    data: user,
  });
});

const setTargets = asyncHandler(async (req, res) => {
  const updates = {};
  const allowedFields = ["targetWeight", "dailyWaterTarget", "dailyCalorieTarget"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  })
    .select("-password -refreshTokenHash")
    .lean();

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Targets updated successfully",
    data: user,
  });
});

module.exports = { getMe, updateProfile, setCalorieGoal, setTargets };
