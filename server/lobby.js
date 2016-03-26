import {addRoom, Room} from './room';
import {LasVegas} from './lasvegas';

export class Lobby extends Room {
  constructor(server) {
    super(server);
    this.games = new Map().set('LasVegas', LasVegas);
  }
  
  onConnect(id) {
    this.join(id, { nick: "User" + id });
  }
  
  create(id, message) {
    var room = new this.games.get(message.game);
    var roomId = addRoom(room);    
    this.leave(id);
    room.join(id);
    this.broadast('room', 'created');
  }
  
    
}