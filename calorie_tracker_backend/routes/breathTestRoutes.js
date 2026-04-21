const express = require("express");
const { createBreathTestResult, getBreathTestHistory } = require("../controllers/breathTestController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { breathTestValidator } = require("../validators/breathTestValidator");

const router = express.Router();

router.use(protect);

router.post("/", breathTestValidator, validate, createBreathTestResult);
router.get("/", getBreathTestHistory);

module.exports = router;
