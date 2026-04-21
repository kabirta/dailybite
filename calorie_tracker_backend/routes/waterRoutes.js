const express = require("express");
const { addWaterIntake, getDailyWaterTotal } = require("../controllers/waterController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { addWaterValidator, waterDateValidator } = require("../validators/waterValidator");

const router = express.Router();

router.use(protect);

router.post("/", addWaterValidator, validate, addWaterIntake);
router.get("/daily", waterDateValidator, validate, getDailyWaterTotal);

module.exports = router;
