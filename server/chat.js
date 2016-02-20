var server = require('./server.js')
var chat = function () {}
module.exports = new chat()

var members = {}

chat.prototype.login = function (id, message) {
    var member = members[id]
    if (member === undefined) {
        member = members[id] = { 
            nick: message.nick
        }
        server.send(id, { cmd: 'loggedin', nick: message.nick })
        server.broadcast({ cmd: 'join', nick: message.nick, members: dictionary.map(members, function (guy, _, $) { return guy.nick }) })    
    }
}

chat.prototype.say = function (id, message) {
    server.broadcast({ cmd: 'said', nick: message.nick })
}