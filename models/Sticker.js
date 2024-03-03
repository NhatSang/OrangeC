const mongoose = require("mongoose");

const stickerSchema = new mongoose.Schema({
    urlImage: String,
  });

const Sticker = mongoose.model("Sticker", stickerSchema);
module.exports = Sticker;