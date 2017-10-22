module.exports = function(app, passport){

	//HOME PAGE
	app.get("/", function(req, res){
		res.render("index.ejs");
	});

	//LOGIN
	app.get("/login", function(req, res){
		res.render("login.ejs");
	});
	app.post("/login", passport.authenticate("local", {
			successRedirect: "/profile",
			failureRedirect: "/login",
			failureFlash: true
		})
	);

	//REGISTER
	app.get("/register", function(req, res){
		res.render("register.ejs");
	});

	//PROFILE PAGE
	app.get("/profile", isLoggedIn, function(req, res){
		res.render("profile.ejs", {
			user : req.user //get the user out of session and pass to the template
		});
	});

	//LOGOUT
	app.get("/logout", function(req, res){
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