// server.js

// Require the tools we need
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const dbConfig = require("./config/db.js");
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
mongoose.Promise = Promise; //set mongoose to leverage built in JS ES6 promises
const db = mongoose.connection;
mongoose.connect("mongodb://KKuhn09:J0hnD0375257@ds133856.mlab.com:33856/heroku_9c1h39z8" || dbConfig.url);
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

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

//Controllers
require("./controllers/users.js")(app, passport); //Load routes and pass in app and passport

//Launch the server
app.listen(port);
console.log("Listening on port " + port);