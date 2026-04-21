const express = require("express");
const { addWeightLog, getWeightHistory } = require("../controllers/weightController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { addWeightValidator, weightHistoryValidator } = require("../validators/weightValidator");

const router = express.Router();

router.use(protect);

router.post("/", addWeightValidator, validate, addWeightLog);
router.get("/history", weightHistoryValidator, validate, getWeightHistory);

module.exports = router;
