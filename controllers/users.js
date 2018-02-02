//Models for MongoDB interaction
const User = require("../models/user.js");
const Group = require("../models/group.js");
//For emailer
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
 service: "gmail",
 auth: {
        user: "holiday.gift.exchange1@gmail.com",
        pass: "J0hnD0375257"
    }
});
let mailOptions = {
  from: "holiday.gift.exchange1@gmail.com", // sender address
  to: "to@email.com", // list of receivers
  subject: "Holiday Gift Exchange Details!", // Subject line
  html: ""// plain text body
};

// controllers/routes.js
module.exports = function(app, passport){

	//==========
	//HOME ROUTE
	//==========

	//Render home page
	app.get("/", function(req, res){
		res.render("index.ejs", {loginMessage: req.flash("loginMessage")});
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
			failureRedirect: "/",
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
			var newGroup = new Group({location: req.body.location, budget: req.body.budget});
			newGroup.members.push({memberUsername: user.username, memberEmail: user.email});
			newGroup.save(function(err){
				if(err) throw err;
			});
			user.groupId = newGroup._id;
			user.save(function(err){
				if(err) throw err;
			});
		});
		res.redirect("/addmembers");
	});

	//Render add members page
	app.get("/addmembers", function(req, res){
		const userId = req.user.id; //Store user id
		//Find user in database
		User.findOne({"_id" : userId}, function(err, user){
			//Find the group associated with the user
			Group.findOne({"_id" : user.groupId}, function(err, group){
				//Render the add members page
				res.render("addmembers.ejs", {
					group: group, // pass group info to the template
					user : req.user // pass user info to the template
				});
			});	
		});
	});

	//Create a new group member
	app.post("/addmembers", function(req, res){
		const userId = req.user.id; //Store user id
		//Find user in database
		User.findOne({"_id" : userId}, function(err, user){
			Group.findOne({"_id" : user.groupId}, function(err, group){
				group.members.push({memberUsername: req.body.name, memberEmail: req.body.email});
				group.save(function(err){
					if(err) throw err;
				});
			});
		});
		res.redirect("/addmembers");
	});

	//Send email to group with Gift Exchange details
	app.post("/sendemail", function(req, res){
		const userId = req.user._id; //Store user id
		//Find user in database
		User.findOne({"_id" : userId}, function(err, user){
			Group.findOne({"_id" : user.groupId}, function(err, group){
				for(var i=0;i<group.members.length;i++){
					const membersLength = group.members.length-1;
					if(i===membersLength){
						group.members[i].SSEmail = (group.members[0].memberEmail);
						group.save(function(err){
							if(err) throw err;
						});
						//Mail group information
						mailOptions.to = group.members[i].SSEmail;
						mailOptions.html += "<p>Location: "+group.location+"</p>";
						mailOptions.html += "<p>Budget: "+group.budget+"</p>";
						mailOptions.html += "<p>You're the gifter for: "+group.members[i].memberUsername+"</p>";
						transporter.sendMail(mailOptions, function(err, info){
							if(err) throw err;
						});
						mailOptions.html = "";
					} else{
						const SSMember = i + 1;
						group.members[i].SSEmail = (group.members[SSMember].memberEmail);
						group.save(function(err){
							if(err) throw err;
						});
						//Mail group information
						mailOptions.to = group.members[i].SSEmail;
						mailOptions.html += "<p>Location: "+group.location+"</p>";
						mailOptions.html += "<p>Budget: "+group.budget+"</p>";
						mailOptions.html += "<p>You're the gifter for: "+group.members[i].memberUsername+"</p>";
						transporter.sendMail(mailOptions, function(err, info){
							if(err) throw err;
						});
						mailOptions.html = "";
					}
				}
			});
		});
		res.redirect("/addmembers");
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