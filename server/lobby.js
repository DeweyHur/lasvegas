var server = require ('./server.js')
var chat = require ('./chat.js')
// var games = { lasvegas: require ('./lasvegas.js') }

var lobby = Object.create(chat)
module.exports = lobby

lobby.prototype.create = function (id, message) {
	if (games[message.game] !== undefined) {
		server.on(games[message.game])
	}	
}

