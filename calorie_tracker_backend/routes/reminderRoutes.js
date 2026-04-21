const express = require("express");
const {
  createReminder,
  listReminders,
  getReminderById,
  updateReminder,
  toggleReminder,
  deleteReminder,
} = require("../controllers/reminderController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createReminderValidator,
  updateReminderValidator,
  reminderIdValidator,
  toggleReminderValidator,
} = require("../validators/reminderValidator");

const router = express.Router();

router.use(protect);

router.post("/", createReminderValidator, validate, createReminder);
router.get("/", listReminders);
router.get("/:reminderId", reminderIdValidator, validate, getReminderById);
router.patch("/:reminderId", updateReminderValidator, validate, updateReminder);
router.patch("/:reminderId/status", toggleReminderValidator, validate, toggleReminder);
router.delete("/:reminderId", reminderIdValidator, validate, deleteReminder);

module.exports = router;
