//Models for MongoDB interaction
const User = require("../models/user.js");
const Group = require("../models/group.js");

// controllers/routes.js
module.exports = function(app, passport){

	//==========
	//HOME ROUTE
	//==========

	//Render home page
	app.get("/", function(req, res){
		res.render("index.ejs");
	});

	//===========
	//LOGIN ROUTE
	//===========

	//Render login page
	app.get("/login", function(req, res){
		res.render("login.ejs", { message: req.flash("loginMessage") });
	});

	//Log the user in
	app.post("/login", passport.authenticate("local-login", {
			successRedirect: "/profile", 
			failureRedirect: "/login",
			failureFlash: true
		}),
		function(req, res){
			console.log("hello");
			if(req.body.remember){
				req.session.cookie.maxAge = 1000 * 60 * 3;
			} else {
				req.session.cookie.expires = false;
			}
			res.redirect("/");
		}
	);

	//==============
	//REGISTER ROUTE
	//==============

	//Render register page
	app.get("/register", function(req, res){
		//render the page and pass in any flash data if it exists
		res.render("register.ejs", { message: req.flash("signupMessage") });
	});

	//process the register form
	app.post("/register", passport.authenticate("local-signup", {
		successRedirect: "/profile", //redirect to the secure profile section if succcess
		failureRedirect: "/register", //redirect to register page if error
		failureFlash: true //allow flash messages
	}));

	//===================
	//USER PROFILE ROUTES
	//===================
	//These routes are only available to users who are logged in

	//Render profile page
	app.get("/profile", isLoggedIn, function(req, res){
		res.render("profile.ejs", {
			user : req.user // pass user info to the template
		});
	});

	//Render create a group page
	app.get("/creategroup", isLoggedIn, function(req, res){
		res.render("creategroup.ejs", {
			user : req.user // pass user info to the template
		});
	});

	//Create basic group collection
	app.post("/creategroup", function(req, res){
		const userId = req.user.id; //Store user id
		//Find user in database
		User.findOne({"_id": userId}, function(err, user){
			console.log(user);
			var newGroup = new Group({location: req.body.location, budget: req.body.budget});
			newGroup.members.push({memberUsername: user.username, memberEmail: user.email});
			newGroup.save(function(err){
				if(err) throw err;
			});
			user.groups.push(newGroup._id);
			user.save(function(err){
				if(err) throw err;
			});
		});
		res.redirect("/addmembers");
	});

	//Render add members page
	app.get("/addmembers", function(req, res){
		res.render("addmembers.ejs", {
			user : req.user // pass user info to the template
		});
	});

	//============
	//LOGOUT ROUTE
	//============

	//Logout the user
	app.get("/logout", function(req, res){
		req.logout();
		res.redirect("/");
	});

};

//Route middleware to make sure user is logged 
function isLoggedIn(req, res, next){
	//if user is authenticated in the session, carry on
	if(req.isAuthenticated())
		return next();

	//if they aren't redirect them to the home page
	res.redirect("/");
}