const { body } = require("express-validator");

const breathTestValidator = [
  body("inhaleTime").isFloat({ min: 0 }).withMessage("inhaleTime must be a non-negative number"),
  body("exhaleTime").isFloat({ min: 0 }).withMessage("exhaleTime must be a non-negative number"),
  body("targetHoldTime")
    .not()
    .exists()
    .withMessage("targetHoldTime is fixed by backend and cannot be provided"),
  body("actualHoldTime")
    .isFloat({ min: 0 })
    .withMessage("actualHoldTime must be a non-negative number"),
];

module.exports = { breathTestValidator };
