var express = require('express')
var bodyParser = require('body-parser')
var cookie = require('cookie')
var app = express()
var flashio = require('./flashio/flashio.js')
var dictionary = require('./dictionary.js')

const RESTApiPort = 8080
const FlashioPort = 3000
var webserver = flashio.createServer(FlashioPort)
console.log('Websocket listening from', FlashioPort);

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
  console.log('/ requested.')
});

app.listen(RESTApiPort, function () {
  console.log('RESTApi listening from' , RESTApiPort , '...')
});

var server = module.exports = {};
var sockets = {}
var listeners = {}

server.broadcast = function (content) {
  dictionary.forEach(sockets, function (id, _, $) {
    var socket = sockets[id].socket
    console.log('broadcasting', socket, '(', id, ')') 
    webserver.send(socket, content)
  })
  console.log('broadcast(', dictionary.length(sockets), ') -', content) 
}

server.send = function (id, content) {
  webserver.send(sockets[id].socket, content)
}

server.on = function (target, listener) {
  listeners[target] = listener
}

server.off = function (target, listener) {
  delete listeners[target]
}

webserver.on('connect', function (data) {
  sockets[data.socket.id].socket = data.socket
  console.log(data.socket.id + " connected.")
})

webserver.on('end', function (data) {
  delete sockets[data.socket.id]
  console.log("Socket", data.socket.id, "disconnected.")
})

webserver.on('data', function (data) {
  console.log("Receiving from", data.socket.id, "-", data.message)
  if (listeners[data.message.target] !== undefined)
    listeners[data.message.target](data.socket.id, data.message)
})