import {Server} from './server';
import {shuffle} from './array';
import {Lobby} from './lobby'

var server = new Server();
var lobby = new Lobby(server);
server.defaultListeners.add(lobby);
console.log('Server is ready...');