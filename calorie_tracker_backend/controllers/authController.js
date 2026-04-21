const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const buildAuthResponse = (user, accessToken, refreshToken) => ({
  status: "success",
  data: {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      goal: user.goal,
      dailyCalorieTarget: user.dailyCalorieTarget,
      role: user.role,
    },
    accessToken,
    refreshToken,
  },
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "User already exists with this email");
  }

  const user = await User.create({ name, email, password });
  const tokenPayload = { sub: user._id.toString(), role: user.role };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  user.refreshTokenHash = refreshTokenHash;
  await user.save();

  res
    .status(StatusCodes.CREATED)
    .json(buildAuthResponse(user, accessToken, refreshToken));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshTokenHash");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const tokenPayload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  res.status(StatusCodes.OK).json(buildAuthResponse(user, accessToken, refreshToken));
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.sub).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token is invalid");
  }

  const isValidStoredToken = await bcrypt.compare(token, user.refreshTokenHash);
  if (!isValidStoredToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token does not match");
  }

  const tokenPayload = { sub: user._id.toString(), role: user.role };
  const newAccessToken = signAccessToken(tokenPayload);
  const newRefreshToken = signRefreshToken(tokenPayload);
  user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) {
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Logged out",
    });
  }

  try {
    const decoded = verifyRefreshToken(token);
    await User.findByIdAndUpdate(decoded.sub, { $unset: { refreshTokenHash: 1 } });
  } catch (error) {
    // Idempotent logout: return success even if token is invalid.
  }

  return res.status(StatusCodes.OK).json({
    status: "success",
    message: "Logged out",
  });
});

module.exports = { register, login, refreshToken, logout };
