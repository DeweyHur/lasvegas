const flashio = require('./flashio/flashio');
const EventEmitter = require('events').EventEmitter;

module.exports.Server = class Server extends EventEmitter {
  constructor() {
    super();
    const FlashioPort = 8080;
    this.webserver = flashio.createServer(FlashioPort);
    this.sockets = new Map();
    this.defaultListeners = new Set();

    this.webserver.on('connect', data => {
      console.log(`Socket ${data.socket.id} connected.`);
      this.sockets.set(data.socket.id, { socket: data.socket, listeners: new Set() });
      for (let listener of this.defaultListeners){
        this.listen(data.socket.id, listener);
        listener.onConnect(data.socket.id);
      }
    });
    
    this.webserver.on('end', data => {
      console.log(`Socket ${data.socket.id} disconnected.`);
      this.sockets.get(data.socket.id).listeners.forEach(listener => 
        listener.leave(data.socket.id)
      );
      delete this.sockets.delete(data.socket.id);
    });
    
    this.webserver.on('data', data => {
      console.log(`Receiving from ${data.socket.id} - ${JSON.stringify(data.message)}`);
      let listeners = new Set(this.sockets.get(data.socket.id).listeners);
      listeners.forEach(listener => {
        var { message: { cmd: func }, socket: { id: id } } = data;
        console.log(`server data - (${id}) -${func}->`);
        console.log(`${listener[func]}`);
        listener[func](id, data.message);
      });
    });
    console.log('Websocket listening from', FlashioPort);
  }
  
  broadcast(content, ...ids) {
    ids.forEach(id => this.webserver.send(this.sockets.get(id).socket, content));
  }
  
  send(content, id) {    
    console.log(`Send(${id}) - ${JSON.stringify(content)}`);
    this.webserver.send(this.sockets.get(id).socket, content);
  }
  
  listen(id, listener) {
    console.log(`listener added - Socket ${id} to ${listener.constructor.name}`);
    this.sockets.get(id).listeners.add(listener);
  }
  
  forget(id, listener) {
    console.log(`listener removed - Socket ${id} to ${listener.constructor.name}`);
    this.sockets.get(id).listeners.delete(listener);
  }
};
