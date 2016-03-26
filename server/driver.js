var server = require('./server.js')
var lobby = require ('./lobby.js')

server.on('lobby', lobby)
