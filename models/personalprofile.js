const mongoose = require("mongoose");

const autoSchema = mongoose.Schema({
  userid: String,
  emojiData: [{ type: Object }],
});

module.exports = mongoose.model("PersonalProfile", autoSchema);
