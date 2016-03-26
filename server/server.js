// var express = require('express');
// var bodyParser = require('body-parser');
// var cookie = require('cookie');
// var app = express();
// var dictionary = require('./dictionary.js');
// var roomlib = require('./room.js');

// const RESTApiPort = 8080

// // create application/json parser
// var jsonParser = bodyParser.json();
// // create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: false });

// app.get('/', function (req, res) {
//   console.log('/ requested.');
// });

// app.listen(RESTApiPort, function () {
//   console.log('RESTApi listening from' , RESTApiPort , '...');
// });

import flashio from './flashio/flashio';
import { EventEmitter } from 'events';

export class Server extends EventEmitter {
  constructor() {
    super();
    const FlashioPort = 3000;
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
      this.sockets.get(data.socket.id).listeners.forEach(listener => {
        var { message: { cmd: func }, socket: { id: id } } = data;
        listener[func](id, data.message);
      });
    });
    
    console.log('Websocket listening from', FlashioPort);
  }
  
  broadcast(content, ...ids) {
    console.log(`broadcast(${JSON.stringify(ids)}) from server - ${JSON.stringify(content)}`);
    ids.forEach(id => this.webserver.send(this.sockets.get(id).socket, content));
  }
  
  send(content, id) {    
    console.log(`Send(${id}) - ${JSON.stringify(content)}`);
    this.webserver.send(this.sockets.get(id).socket, content);
  }
  
  listen(id, listener) {
    console.log(`listener added - Socket ${id}`);
    this.sockets.get(id).listeners.add(listener);
  }
  
  forget(id, listener) {
    console.log(`listener removed - Socket ${id}`);
    this.sockets.get(id).listeners.delete(listener);
  }
};