const { StatusCodes } = require("http-status-codes");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const env = require("../config/env");
const PhotoAlbum = require("../models/PhotoAlbum");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new ApiError(StatusCodes.BAD_REQUEST, "Only image files are allowed"));
  },
});

const uploadImage = async (file) => {
  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const uploadResult = await cloudinary.uploader.upload(base64Image, {
    folder: env.CLOUDINARY_UPLOAD_FOLDER,
    resource_type: "auto",
  });

  return {
    imageUrl: uploadResult.secure_url,
    imagePublicId: uploadResult.public_id,
  };
};

const createPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Image file is required");
  }

  const { imageUrl, imagePublicId } = await uploadImage(req.file);

  const photo = await PhotoAlbum.create({
    user: req.user._id,
    imageUrl,
    imagePublicId,
    caption: typeof req.body.caption === "string" ? req.body.caption.trim() : "",
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Photo uploaded successfully",
    data: photo,
  });
});

const listMyPhotos = asyncHandler(async (req, res) => {
  const photos = await PhotoAlbum.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

  res.status(StatusCodes.OK).json({
    status: "success",
    data: photos,
  });
});

module.exports = {
  upload,
  createPhoto,
  listMyPhotos,
};
