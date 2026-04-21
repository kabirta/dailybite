const mongoose = require("mongoose");

const photoAlbumSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  { timestamps: true }
);

photoAlbumSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("PhotoAlbum", photoAlbumSchema);
