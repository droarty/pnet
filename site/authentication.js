var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var User = require('./models/user.js');
var config = require('./config/oauth.js');

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log('in passport');
    var user = new User();
    user.find('first', {where: 'oauthID = \'' + profile.id + '\'' }, function(err, user) {
      console.log('in find');
      if(err) {
        console.log(err);  // handle errors!
      }
      if (!err && !!user) {
        console.log('in got user');
        console.log(user);
        done(null, user);
      } else {
            console.log('creating user...'+JSON.stringify(profile));
        user = new User({
          fname: profile.name.givenName,
          lname: profile.name.familyName,
          oauthID: profile.id,
          email: profile.email,
          name: profile.displayName,
          created_at: (new Date()).toISOString().slice(0, 19).replace('T', ' ')
        });
        user.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            console.log("saving user ..." + JSON.stringify(user));
            done(null, user);
          }
        });
      }
    });
  }
));

module.exports = passport;
