//Import mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//Schema for MongoDB User collection
const UserSchema = new Schema({
	firstName:{
		type:String,
		required: true
	},
	lastName:{
		type: String,
		required: true
	},
	username:{
		type: String,
		required: true
	},
	password:{
		type: String,
		required: true
	},
	email:{
		type: String,
		required: true
	},
	groups: [{
		type: Schema.Types.ObjectId,
		ref: 'Group'
	}]
});
//Create User model with mongoose
module.exports = mongoose.model('User', UserSchema);