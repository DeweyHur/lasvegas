import {Server} from './server'

let rooms = new Map();
let availableRoomId = 1;

export function addRoom(room) {
  let id = availableRoomId++;
  rooms.set(id, room);
  return id;  
}

export function getRoom(id) {
  return rooms.get(id);
};
;
export function removeRooms(id) {
  rooms.delete(id);
};
;
export class Room {
  constructor(server) {
    this.server = server;
    this.members = new Map();
  }
  
  send(content, id) {
    this.server.send(content, id);
  }
  
  broadcast(content) {
    if (this.members.length > 0)
      this.server.broadcast(content, ...this.members.keys());
  }
  
  join(id, member) {
    this.members.set(id, member);
    this.broadcastMembers();
  }
  
  leave(id) {
    this.members.delete(id);
    this.broadcastMembers();
  }
  
  broadcastMembers() {
    this.broadcast({ cmd: 'members', members: [...this.members.values()] });
  }
  
  nick(id, message) {
    console.log(`nick - ${JSON.stringify(message)}`);
    let member = this.members.get(id); 
    member.nick = message.nick;
    this.send({ cmd: 'you', info: member }, id);
    this.broadcastMembers();
  }
  
  say(id, message) {
    this.broadcast({ cmd: 'said', nick: this.members.get(id).nick, chat: message.chat });
  }
}

export class GameRoom extends Room {
  constructor(server) {
    super(server);
  }
  
  init() {
    throw 'Implement init()!';
  }
  
  ready(id, message) {
    this.members.get(id).ready = true;
    if (this.members.values().every(member => member.ready === true))
      this.init();
  }  
}

