//config/passport.js

//Local Passport Strategy
const LocalStrategy = require("passport-local").Strategy;

//Load up the user model
const User = require("../models/user.js")
const bCrypt = require("bcrypt-nodejs");

//Helper function to validate password using bCrypt
var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}
//Helper function to generate hash using bCrypt
var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

//Expose this function to the app using module.exports
module.exports = function(passport){
	
	//PASSPORT SESSION SETUP
	//required for persisten login sessions
	//passport needs ability to serialize and deserialize users out of the session

	//Serialize the user for the session
	passport.serializeUser(function(user, done) {
  		done(null, user._id);
	});

	//Deserialize the user
	passport.deserializeUser(function(id, done) {
  		User.findById(id, function(err, user) {
    		done(err, user);
  		});
	});

	//LOCAL LOGIN
	passport.use('local-login', new LocalStrategy({
			usernameField: "username",
			passwordField: "password",
			passReqToCallback: true
		},
		function(req, username, password, done){
			//Check if username exists in Mongo
			User.findOne({'username':username}, function(err, user){
				//Return error if any
				if(err) return done(err);
				//If user does not exist
				if(!user){
					return done(null, false, req.flash("loginMessage", "No user found."));
				}
				//If user exists but incorrect password
				if(!isValidPassword(user, password)){
					return done(null, false, req.flash("loginMessage", "Oops! Wrong password."));
				}
				//If everything matches, return successful user
				return done(null, user);
			});
		}
	));
	
	//LOCAL SIGNUP
	passport.use("local-signup", new LocalStrategy({
			usernameField: "username",
			passwordField: "password",
			passReqToCallback: true //allows us to pass back the entire request to the callback
		},
		function(req, username, password, done){
			findOrCreateUser = function(){
				//Check in Mongo for user with username
				User.findOne({'username':username},function(err, user){
					console.log(user);
					//Return error if any
					if(err){
						console.log('Error in SignUp: '+err);
						return done(err);
					}
					//If username already exists
					if(user){
						console.log('User already exists');
						return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
					}
					//If there is no user with that username
					else{
						//Create the user
						var newUser = new User();
						newUser.username = username,
						newUser.password = createHash(password);//encrypt the password
						//newUser.email = req.param('email');

						//Save the user
						newUser.save(function(err){
							if(err){
								console.log('Error in Saving user: '+err); 
								throw err;
							}
							return done(null, newUser);
						});
					}
				});
			};

			// Delay the execution of findOrCreateUser and execute 
	    	// the method in the next tick of the event loop
			process.nextTick(findOrCreateUser);
		}
	));
};