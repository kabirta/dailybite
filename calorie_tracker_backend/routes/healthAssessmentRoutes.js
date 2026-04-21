const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  upsertHealthAssessment,
  getMyHealthAssessment,
} = require("../controllers/healthAssessmentController");
const { createHealthAssessmentValidator } = require("../validators/healthAssessmentValidator");

const router = express.Router();

router.use(protect);

router.post("/", createHealthAssessmentValidator, validate, upsertHealthAssessment);
router.get("/", getMyHealthAssessment);

module.exports = router;
