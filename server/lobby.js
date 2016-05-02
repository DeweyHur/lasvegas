import {addRoom, Room} from './room';
import {LasVegas} from './lasvegas';

export class Lobby extends Room {
  constructor(server) {
    super(server);
    this.games = new Map().set('LasVegas', LasVegas);
  }
  
  onConnect(id) {
    this.join(id, { id: id, nick: "User" + id });
  }
  
  create(id, message) {
    var room = this.games.get(message.game).createGame(this.server);
    var roomId = Room.register(room);    
    var member = this.leave(id);
    room.join(id, member);
  }
  
  leave(id) {
    var member = this.members.get(id);
    this.members.delete(id);
    this.server.forget(id, this);
    this.broadcastMembers();
    return member;
  }  
}