// from https://github.com/mjhea0/passport-examples

// dependencies
var fs = require('fs');
var express = require('express');
// var routes = require('./routes');
var path = require('path');
var config = require('./config/oauth.js');
var passport = require('./authentication.js');
var routes_for_auth = require('./routes_for_auth');
var routes_for_client = require('./routes_for_client');
var routes_for_server = require('./routes_for_server');
//var routes_for_auth = require('./routes_for_api');

var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'my_precious' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/test3', function(req, res){
  res.send('test3');
});

routes_for_auth(app, passport);
routes_for_client(app);
routes_for_server(app);

// port
app.listen(1337);
console.log('listening on :1337')

module.exports = app;
