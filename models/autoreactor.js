const mongoose = require("mongoose");

const autoSchema = mongoose.Schema({
  userid: String,
  channel: String,
  pollTopic: String,
  isPoll: Boolean,
  pollColor: String,
  pollImage: String,
  optionsText: [Object],
  grandTotal: [String],
  emojis: [{ type: String }],
  statsReactionNumber: Number,
  endReactionEmoji: String,
  endReactionNumber: Number,
  endReactionTime: Number,
  role: String,
  notify: Number,
  pin: String,
  rep: String,
  id: String,
  repNum: Number,
  reactorSettings: Object,
  isRunning: Boolean,
  anon: Boolean,
  hasEnded: Boolean,
  pollRole: Number,
});

module.exports = mongoose.model("Autor", autoSchema);
