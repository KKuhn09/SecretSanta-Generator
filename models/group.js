//Import mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//Schema for MongoDB Group collection
const GroupSchema = new Schema({
	budget: {
		type: String,
		required: true
	},
	location: {
		type: String,
		required: true
	},
	members: [{
		memberUsername: String,
		memberEmail: String,
		SSEmail: String
	}]
});
//Create User model with mongoose
module.exports = mongoose.model('Group', GroupSchema);