const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(StatusCodes.BAD_REQUEST).json({
    status: "error",
    message: "Invalid request data",
    errors: errors.array().map((item) => ({
      field: item.path,
      message: item.msg,
    })),
  });
};

module.exports = validate;
