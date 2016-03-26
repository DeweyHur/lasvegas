var server = require('./server.js')

var lasvegas = module.exports = {};

var game
var currentRound = 0
const TOTAL_ROUND = 4
const TABLE_COUNT = 6
const MAX_PRIZE = 5

function gameover() {
  server.broadcast({ cmd: 'result' })
}

function roundInit() {
  var round = game.rounds[game.rounds.length - 1]
  round.tables = [];
  for (var index = 0; index < TABLE_COUNT; ++index) {
    var totalPrize = 0
    var prizes = []
    while (totalPrize < MAX_PRIZE) {
      var prize = Math.floor(Math.random() * 9 + 1)
      prizes.push(prize)
      totalPrize += prize;
    }
    prizes.sort()
    round.tables.push(prizes) 
  }
  server.broadcast({ cmd: 'round', game: game })  
} 

webserver.on('data', function (data) {
  console.log(data.message);
  var member = members[data.socket.id]
  var player = members[data.socket.id]
  switch (data.message.cmd) {
    case 'lobby':
      if (member === undefined) {
        member = members[data.socket.id] = {
          nick: data.message.nick
        }
        webserver.send(data.socket, { cmd: 'lobby', nick: data.message.nick });
        server.broadcast({ cmd: 'join', nick: data.message.nick, members: dictionary.keys(members) }) 
      }
      break;

    case 'chat':
      server.broadcast({ cmd: 'chat', nick: members[data.socket.id].nick, chat: data.message.chat })
      break;

    case 'gameReady':
      player.ready = true
      server.broadcast({ cmd: 'gameReady', nick: player.nick })
      var isEveryGameReady = dictionary.keys(members).every(function (id, _, $) {
        return members[id].ready === true
      })
      if (isEveryGameReady) {
        server.broadcast({ cmd: 'game', members: dictionary.keys(members) })
        game = { rounds: [ { members: {} } ] }
        currentRound = 0;
      }
      break;

    case 'roundReady':
      game.rounds[currentRound].members[members[data.socket.id]] = { remain: 8 }
      if (dictionary.length(game.rounds.members) == dictionary.length(members)) {
        if (game.rounds.length == TOTAL_ROUND) {
          gameover()
        } else {
          roundInit()
        } 
      }      
      break;
      
    case 'roundRoll':
      
      break;
  }
});
