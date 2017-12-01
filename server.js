// server.js

// Require the tools we need
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const dbConfig = require("./config/db.js")
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
//Require passport tool
const passport = require("passport");
const flash = require("connect-flash");

const app = express();//Store express app 

//Store port with either the deployed port or local port 3000
const port = process.env.PORT || 3000;


//Set up express app
app.use(morgan("dev")); //Log every request to the console
app.use(cookieParser()); //Read cookies (needed for authentication)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(express.static("public"));//Serve static files from the public directory
app.set("view engine", "ejs"); //Ejs for templating

//MongoDB config
mongoose.connect(process.env.MONGODB_URI || dbConfig.url);

//Passport config
require("./config/passport")(passport);

app.use(session({
	secret: "mySecretKey",
	resave: true,
	saveUninitialized: true
})); //session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//Routes
require("./app/routes.js")(app, passport); //Load routes and pass in app and passport

//Launch the server
app.listen(port);
console.log("Listening on port " + port);