import {Server} from './server'

let nextRoomId = 1;
let rooms = new Map();

function removeRooms(id) {
  let room = getRoom(id);
  console.log(`Room ${id}(${room.constructor.name}) removed.`);
  rooms.delete(id);
};

export class Room {
  constructor(server) {
    this.server = server;
    this.members = new Map();
  }
  
  static get nextId() { return nextRoomId++; }
  
  static register(room) {
    let id = nextRoomId++;
    rooms.set(id, room);
    room.id = id;
    console.log(`Room ${id} created.`);
    return id;
  }
  
  static unregister(room) {
    rooms.delete(room.id);
    console.log(`Room ${room.id} removed.`);
  }
  
  send(content, id) {
    this.server.send(content, id);
  }
  
  broadcast(content) {
    var memberids = [...this.members.keys()];
    var className = this.constructor.name;
    if (memberids.length > 0) {
      console.log(`broadcast(${memberids.join(',')}) on ${className}(${this.id}) - ${JSON.stringify(content)}`);
      this.server.broadcast(content, ...this.members.keys());
    } else {
      console.log(`broadcast to no one on ${className} - ${JSON.stringify(content)}`);
    }
  }
  
  join(id, member) {
    console.log(`join - ${id}, ${JSON.stringify(member)}`);
    this.members.set(id, member);
    this.server.listen(id, this);
    var memberids = [...this.members.keys()];
    console.log(`members(${memberids.length}) - ${memberids.join(',')}`);
    this.broadcastMembers();
  }
  
  leave(id) {
    var member = this.members.get(id);
    this.members.delete(id);
    this.server.forget(id, this);
    this.broadcastMembers();
    if (this.members.length == 0) {
      Room.unregister(this);
    }
    return member;
  }
  
  broadcastMembers() {
    this.broadcast({ cmd: 'members', members: [...this.members.values()] });
  }
  
  nick(id, message) {
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
    let allReady = Array.from(this.members, x => x[1].ready === true).every(x => x);
    if (allReady) {
      this.onAllReady();
    }
  }  
}

