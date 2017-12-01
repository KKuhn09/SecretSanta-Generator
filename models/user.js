//Import mongoose
const mongoose = require('mongoose');
//Create User model with mongoose
module.exports = mongoose.model('User',{
    username: String,
    password: String,
    email: String
});