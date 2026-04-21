const { StatusCodes } = require("http-status-codes");
const Reminder = require("../models/Reminder");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const MAX_WATER_REMINDERS = 5;

const ensureWaterReminderLimit = async (userId, excludeReminderId = null) => {
  const filter = { user: userId, type: "water" };
  if (excludeReminderId) {
    filter._id = { $ne: excludeReminderId };
  }

  const count = await Reminder.countDocuments(filter);
  if (count >= MAX_WATER_REMINDERS) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You can only create up to ${MAX_WATER_REMINDERS} water reminders`
    );
  }
};

const createReminder = asyncHandler(async (req, res) => {
  const payload = {
    user: req.user._id,
    type: req.body.type,
    message: req.body.message,
    time: req.body.time,
    days: [...new Set(req.body.days)],
    isActive: req.body.isActive ?? true,
  };

  if (payload.type === "water") {
    await ensureWaterReminderLimit(req.user._id);
  }

  const reminder = await Reminder.create(payload);

  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Reminder created successfully",
    data: reminder,
  });
});

const listReminders = asyncHandler(async (req, res) => {
  const reminders = await Reminder.find({ user: req.user._id })
    .sort({ isActive: -1, time: 1, createdAt: -1 })
    .lean();

  res.status(StatusCodes.OK).json({
    status: "success",
    data: reminders,
  });
});

const getReminderById = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.reminderId,
    user: req.user._id,
  }).lean();

  if (!reminder) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Reminder not found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    data: reminder,
  });
});

const updateReminder = asyncHandler(async (req, res) => {
  const existingReminder = await Reminder.findOne({
    _id: req.params.reminderId,
    user: req.user._id,
  });

  if (!existingReminder) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Reminder not found");
  }

  const nextType = req.body.type || existingReminder.type;
  if (nextType === "water" && existingReminder.type !== "water") {
    await ensureWaterReminderLimit(req.user._id, existingReminder._id);
  }

  const allowedFields = ["type", "message", "time", "days", "isActive"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      existingReminder[field] = field === "days" ? [...new Set(req.body.days)] : req.body[field];
    }
  });

  await existingReminder.save();

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Reminder updated successfully",
    data: existingReminder,
  });
});

const toggleReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: req.params.reminderId, user: req.user._id },
    { isActive: req.body.isActive },
    { new: true, runValidators: true }
  ).lean();

  if (!reminder) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Reminder not found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    message: `Reminder ${req.body.isActive ? "activated" : "deactivated"} successfully`,
    data: reminder,
  });
});

const deleteReminder = asyncHandler(async (req, res) => {
  const deleted = await Reminder.findOneAndDelete({
    _id: req.params.reminderId,
    user: req.user._id,
  }).lean();

  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Reminder not found");
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Reminder deleted successfully",
  });
});

module.exports = {
  createReminder,
  listReminders,
  getReminderById,
  updateReminder,
  toggleReminder,
  deleteReminder,
};
