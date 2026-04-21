const express = require("express");
const multer = require("multer");
const { StatusCodes } = require("http-status-codes");
const { protect } = require("../middleware/auth");
const ApiError = require("../utils/apiError");
const { upload, createPhoto, listMyPhotos } = require("../controllers/photoAlbumController");

const router = express.Router();

const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      next(new ApiError(StatusCodes.BAD_REQUEST, "Image must be 5MB or smaller"));
      return;
    }

    next(err);
  });
};

router.use(protect);

router.post("/", uploadSingleImage, createPhoto);
router.get("/", listMyPhotos);

module.exports = router;
