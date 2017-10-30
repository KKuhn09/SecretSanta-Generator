//config/passport.js

var LocalStrategy = require("passport-local").Strategy;

//load up the user model
var mysql = require("mysql2");
var bcrypt = require("bcrypt-nodejs");
var dbconfig = require("./database");
var connection = mysql.createConnection(dbconfig.connection);

connection.query("USE " + dbconfig.database);
//expose this function to our app using module.exports
module.exports = function(passport){

	//PASSPORT SESSION SETUP
	//required for persisten login sessions
	//passport needs ability to serialize and deserialize users out of the session

	//used to serialize the user for the session
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	//used to deserialize the user
	passport.deserializeUser(function(id, done){
		connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
			done(err, rows[0]);
		});
	});

	//LOCAL SIGNUP
	passport.use(
		"local-signup",
		new LocalStrategy({
			usernameField: "username",
			passwordField: "password",
			passReqToCallback: true //allows us to pass back the entire request to the callback
		},
		function(req, username, password, done){
			//find user whos username matches the forms username
			//checking to see if user trying to signup already exists
			connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
				if(err) return done(err);
				if(rows.length){
					return done(null, false, req.flash("signupMessage", "That username is already taken."));
				} else{
					//if there is no user with that username, create the user
					var newUserMysql = {
						username: username,
						password: bcrypt.hashSync(password, null, null)
					};
					var insertQuery = "INSERT INTO users ( username, password ) values (?, ?)";
					connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows){
						newUserMysql.id = rows.insertId;
						return done(null, newUserMysql);
					});
				}
			});
		})
	);

	//LOCAL LOGIN
	passport.use(
		"local-login",
		new LocalStrategy({
			usernameField: "username",
			passwordField: "password",
			passReqToCallback: true
		},
		function(req, username, password, done){
			connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
				if(err) return done(err);
				if(!rows.length){
					return done(null, false, req.flash("loginMessage", "No user found."));
				}
				//if the user is found but the password is wrong
				if(!bcrypt.compareSync(password, rows[0].password))
					return done(null, false, req.flash("loginMessage", "Oops! Wrong password."));

				//if everything matches, return successful user
				return done(null, rows[0]);
			});
		})
	);
};