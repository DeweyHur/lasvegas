var express = require('express')
var bodyParser = require('body-parser')
var cookie = require('cookie')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

var members = {}
const port = 8080

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
  trace('/ requested.')
});

io.on('connection', function (socket) {
  console.log('socket.io connected');
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg)
  });
});


http.listen(port, function () {
  console.log('Listening from' , port , '...')
});
