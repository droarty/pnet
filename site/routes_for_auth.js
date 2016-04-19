var User = require('./models/user.js');

// sets up all authentication needs
routes_for_auth = function(app, passport) {
  // serialize and deserialize
  passport.serializeUser(function(user, done) {
    console.log('serializeUser: ' + user.id);
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
      console.log(user);
        if(!err) done(null, user);
        else done(err, null);
      });
  });

  app.get('/login', function(req, res) {
    res.render('login', { title: "Login"});
  });

  app.get('/auth/google',
    passport.authenticate('google', { scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/plus.profile.emails.read'
    ] }
  ));

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/advanced');
    });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('/test', function(req, res){
    res.send('test');
  });
}

module.exports = routes_for_auth;
