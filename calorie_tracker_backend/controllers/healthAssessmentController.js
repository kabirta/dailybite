const { StatusCodes } = require("http-status-codes");
const HealthAssessment = require("../models/HealthAssessment");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const calculateAge = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
  const isBeforeBirthday =
    monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dob.getUTCDate());

  if (isBeforeBirthday) {
    age -= 1;
  }

  return age;
};

const convertHeightToCm = ({ heightUnit, heightCm, heightFt, heightIn }) => {
  if (heightUnit === "cm") {
    return Number(heightCm);
  }

  // 1 foot = 30.48 cm and 1 inch = 2.54 cm.
  return Number(heightFt) * 30.48 + Number(heightIn) * 2.54;
};

const upsertHealthAssessment = asyncHandler(async (req, res) => {
  const {
    hereTo,
    mainHealthGoal,
    healthGoalOption,
    heightUnit,
    heightCm,
    heightFt,
    heightIn,
    currentWeightKg,
    dateOfBirth,
    weightGoalKg,
    sex,
  } = req.body;

  const normalizedHeightCm = Number(convertHeightToCm({ heightUnit, heightCm, heightFt, heightIn }).toFixed(2));
  const age = calculateAge(dateOfBirth);

  const payload = {
    user: req.user._id,
    hereTo,
    mainHealthGoal,
    healthGoalOption,
    heightUnit,
    heightCm: normalizedHeightCm,
    currentWeightKg: Number(currentWeightKg),
    dateOfBirth: new Date(dateOfBirth),
    age,
    weightGoalKg: Number(weightGoalKg),
    sex,
  };

  const assessment = await HealthAssessment.findOneAndUpdate({ user: req.user._id }, payload, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  }).lean();

  await User.findByIdAndUpdate(
    req.user._id,
    {
      age,
      gender: sex,
      height: normalizedHeightCm,
      weight: Number(currentWeightKg),
      targetWeight: Number(weightGoalKg),
    },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Health assessment saved successfully",
    data: assessment,
  });
});

const getMyHealthAssessment = asyncHandler(async (req, res) => {
  const assessment = await HealthAssessment.findOne({ user: req.user._id }).lean();
  if (!assessment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Health assessment not found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: assessment,
  });
});

module.exports = { upsertHealthAssessment, getMyHealthAssessment };
