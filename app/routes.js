module.exports = function(app){

	//HOME PAGE
	app.get("/", function(req, res){
		res.render("index.ejs");
	});

	//LOGIN
	app.get("/login", function(req, res){
		res.render("login.ejs");
	});

	//REGISTER
	app.get("/register", function(req, res){
		res.render("register.ejs");
	});

	//PROFILE PAGE
	app.get("/profile", function(req, res){
		res.render("profile.ejs");
	});

	//LOGOUT
	app.get("/logout", function(req, res){
		res.redirect("/");
	});

};