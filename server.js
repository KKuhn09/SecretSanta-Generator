// server.js

// set up
// require the tools we need
var express = require("express");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var app = express(); //creates express app
//sets our port to either the deployed port or local port 3000
var port = process.env.PORT || 3000;

var passport = require("passport");
var flash = require("connect-flash");

//configuration
require("./config/passport")(passport); //pass passport for config

//set up our express app
app.use(morgan("dev")); //logs every request to the console
app.use(cookieParser()); //read cookies (needed for authentication)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set("view engine", "ejs"); //set up ejs for templating

//routes
require("./app/routes.js")(app, passport); //loads our routes and pass in our app/passport

//launch
app.listen(port);
console.log("Listening on port " + port);