const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const foodRoutes = require("./foodRoutes");
const dailyLogRoutes = require("./dailyLogRoutes");
const waterRoutes = require("./waterRoutes");
const weightRoutes = require("./weightRoutes");
const reminderRoutes = require("./reminderRoutes");
const photoAlbumRoutes = require("./photoAlbumRoutes");
const breathTestRoutes = require("./breathTestRoutes");
const recipeRoutes = require("./recipeRoutes");
const healthAssessmentRoutes = require("./healthAssessmentRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/foods", foodRoutes);
router.use("/logs", dailyLogRoutes);
router.use("/water", waterRoutes);
router.use("/weight", weightRoutes);
router.use("/reminders", reminderRoutes);
router.use("/photoalbum", photoAlbumRoutes);
router.use("/breath-test", breathTestRoutes);
router.use("/recipes", recipeRoutes);
router.use("/health-assessment", healthAssessmentRoutes);

module.exports = router;
