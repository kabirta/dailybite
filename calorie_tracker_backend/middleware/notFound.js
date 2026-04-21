const { StatusCodes } = require("http-status-codes");

const notFoundHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: "error",
    message: `Route not found: ${req.originalUrl}`,
  });
};

module.exports = { notFoundHandler };
