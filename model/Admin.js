const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var Admin = new Schema({
	adminame: {
		type: String
	},
	pass_admin: {
		type: String
	}
})

Admin.plugin(passportLocalMongoose);

module.exports = mongoose.model('Admin', Admin)