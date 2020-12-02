const mongoose = require("mongoose");
const autoSchema = mongoose.Schema({
  userid: String,
  messageid: String,
  emojiData: [{ type: Object }],
});

module.exports = mongoose.model("ReactorProfile", autoSchema);
