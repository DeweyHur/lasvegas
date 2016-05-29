const Server = require('./server').Server;
const shuffle = require('./array').shuffle;
const Lobby = require('./lobby').Lobby;

var server = new Server();
var lobby = new Lobby(server);
server.defaultListeners.add(lobby);
console.log('Server is ready...');