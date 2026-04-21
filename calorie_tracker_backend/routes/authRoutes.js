const express = require("express");
const {
  register,
  login,
  refreshToken,
  logout,
} = require("../controllers/authController");
const validate = require("../middleware/validate");
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
} = require("../validators/authValidator");

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 */
router.post("/register", registerValidator, validate, register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 */
router.post("/login", loginValidator, validate, login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 */
router.post("/refresh", refreshTokenValidator, validate, refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 */
router.post("/logout", logout);

module.exports = router;
