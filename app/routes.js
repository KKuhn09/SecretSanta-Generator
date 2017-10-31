// app/routes.js
module.exports = function(app, passport){

	//HOME PAGE
	app.get("/", function(req, res){
		res.render("index.ejs");
	});

	//LOGIN
	app.get("/login", function(req, res){
		res.render("login.ejs");
	});
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

	//REGISTER
	//show the register form
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

	//PROFILE PAGE
	app.get("/profile", isLoggedIn, function(req, res){
		res.render("profile.ejs", {
			user : req.user //get the user out of session and pass to the template
		});
	});

	//LOGOUT
	app.get("/logout", function(req, res){
		req.logout();
		res.redirect("/");
	});

};

//route middleware to make sure
function isLoggedIn(req, res, next){
	//if user is authenticated in the session, carry on
	if(req.isAuthenticated())
		return next();

	//if they aren't redirect them to the home page
	res.redirect("/");
}