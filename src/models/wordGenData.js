const mongoose = require('mongoose');
const autoSchema = mongoose.Schema({
	userid: String,
	roles: [String],
	channels: [String]
});

module.exports = mongoose.model('UserRecords', autoSchema);
