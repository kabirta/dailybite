const { StatusCodes } = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  if (err.name === "ValidationError") {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: "error",
      message: "Validation failed",
      details: Object.values(err.errors).map((entry) => entry.message),
    });
  }

  if (err.code === 11000) {
    return res.status(StatusCodes.CONFLICT).json({
      status: "error",
      message: "Duplicate field value",
      details: err.keyValue,
    });
  }

  return res.status(statusCode).json({
    status: "error",
    message: err.message || "Something went wrong",
    ...(err.details ? { details: err.details } : {}),
  });
};

module.exports = { errorHandler };
