
/**
 * Module dependencies.
 */

var express = require('express'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  http = require('http'),
  socket = require('./routes/socket.js');

var app = express();
var server = http.Server(app);

// Hook Socket.io into Express
var io = require('socket.io')(server);

// from socket.io mainpage
server.listen(2080);
// Configuration

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

// Socket.io Communication

io.sockets.on('connection', socket);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port 3000");
});
