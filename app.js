// 3rd Party Dependencies
var express = require('express'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  http = require('http'),
  path = require('path'),
  session = require('express-session')
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy;

// Local routes
var socket = require('./routes/socket.js');
var auth = require('./routes/auth.js');

var app = express();
var server = http.Server(app);

// Hook Socket.io into Express
var io = require('socket.io')(server);

var PORT = process.env.PORT || 3000;
var CLIENTID = process.env.CLIENTID || require('./oauth.js').facebook.clientID;
var CLIENTSECRET = process.env.CLIENTSECRET || require('./oauth.js').facebook.clientSecret;
var CALLBACKURL = process.env.CALLBACKURL || require('./oauth.js').facebook.callbackURL;

// Facebook auth stuff
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
 clientID: CLIENTID,
 clientSecret: CLIENTSECRET,
 callbackURL: CALLBACKURL
}, function(accessToken, refreshToken, profile, done) {
   process.nextTick(function () {
     return done(null, profile);
   });
  }
));

// Configuration
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'This is not a secret ;)',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Socket.io Communication

io.sockets.on('connection', socket);

// Facebook Routes
app.get('/auth/facebook', passport.authenticate('facebook'), auth.fbAuth);
app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/' }), auth.fbAuthCallback);
app.get('/username', auth.getUsername);
app.post('/logout', auth.loggingOut);

// Start server
server.listen(PORT, function(){
  console.log("Express server listening on port, " + PORT);
});
