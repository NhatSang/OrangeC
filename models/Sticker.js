const mongoose = require("mongoose");

const stickerSchema = new mongoose.Schema({
  name: String,
  urlImage: [{ type: String }],
});

const Sticker = mongoose.model("Sticker", stickerSchema);
module.exports = Sticker;
