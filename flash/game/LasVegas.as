﻿package game {	import fl.controls.Button;	import flash.display.MovieClip;	import flash.events.Event;	import flash.events.KeyboardEvent;	import flash.events.MouseEvent;	import flash.text.TextField;	import flashio.DataEvent;	import flashio.FlashIO;			public class LasVegas extends MovieClip {				// Scene: Intro		public var nameInput:TextField;		public var startButton:Button;				// Scene: Lobby		public var nameText:TextField;		public var chatText:TextField;		public var chatInput:TextField;		public var membersText:TextField;				// Scene: Game		public var diceGround:DiceGround;		public var roundTextField:TextField;		public var restartButton:Button;				protected var _tables:Vector.<Table> = new Vector.<Table>();		protected var _players:Vector.<Player> = new Vector.<Player>();		protected var _currentPlayer:int = 0;		protected var _game;		protected var _round;		protected var _socket = new FlashIO("127.0.0.1", 3000);				public var self = this;				public function LasVegas() {			trace ("Lobby Started.");						startButton.addEventListener(MouseEvent.CLICK, function (e:MouseEvent) {				_socket.connect();			});						_socket.addEventListener(Event.CONNECT, onConnect);			_socket.addEventListener(Event.CLOSE, function (e:Event) {				trace ("Disconnected");				gotoAndPlay(1, "Intro");				startButton.addEventListener(MouseEvent.CLICK, function (e:MouseEvent) {					_socket.connect();				});			});			_socket.addEventListener(DataEvent.DATA, onData);		}				public function get currentRound() {			return _game.rounds.length;		}				protected function send(data:Object)		{			_socket.send(data);			trace (JSON.stringify(data));		}				protected function ready()		{			send({ cmd: "ready" });		}				protected function onConnect(e:Event)		{			trace ("Connected");			send( { cmd: "nick", nick: nameInput.text } );						gotoAndPlay(1, "Lobby");		}				protected function onData(e:DataEvent)		{			trace ("Data:", JSON.stringify(e.data));			switch (e.data.cmd) {				case "you":					nameText.text = e.data.info.nick;					chatInput.addEventListener(KeyboardEvent.KEY_DOWN, function (e:KeyboardEvent) {						if (e.charCode == 13 /* ENTER */ && chatInput.text.length > 0)						{							if (chatInput.text.charAt(0) == '/') {								var token = chatInput.text.substr(1).split(" ");								switch (token[0]) {									case "create":										trace ("Create game:", token[1]);										send( { cmd: token[0], game: token[1] } );										break;									case "ready":										trace ("Game Ready");										send( { cmd: token[0] });										break;									default:										trace ("Unknown command:", token[0]);										break;								}							} else {								send( { cmd: "say", chat: chatInput.text } );							}							chatInput.text = "";						}					});											break;									case "said":					chatText.text += e.data.nick + ": " + e.data.chat + "\n";					break;									case "members":					updateChatMembers(e.data.members);					break;									case "gameStart":					_game = e.data.game;					gotoAndPlay(1, "Game");					onEnterGameScene();					break;									case "initRound":					_game = e.data.game;					initRound();					break;									case "roll":					doTurn(e.data.dices);					break;			}		}				protected function updateChatMembers(members:Array)		{			membersText.text = members.map(function (member) {				return member.nick;			}).join('\n');					}				public function onEnterGameScene()		{			var index;			var Colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00];				_game.players.forEach(function (player, index, $) {				var panel:Player = getChildByName("player" + (index + 1)) as Player;				if (panel)				{					panel.nick = player.nick;					panel.score = player.score;					player.color = Colors[index - 1];					_players.push(panel);				}			});						for (index = 1; index <= 6; ++index)			{				var table:Table = getChildByName("table" + index) as Table;				if (table)				{					table.setup(index, _players);					_tables.push(table);				}							}						_currentPlayer = 0;			roundTextField.text = "Round " + currentRound + "/4";			ready();		}				public function initRound()		{			trace ("initRound()", JSON.stringify(_game));			_players.forEach(function (player, index) {				trace ("Players - ", JSON.stringify(_game.players));				trace ("Index - ", index);				trace ("DiceCount - ", _game.players[index].diceCount);				player.diceCount = _game.players[index].diceCount;			});						var round = _game.rounds[_game.rounds.length - 1];			round.tables.forEach(function (table, index) {				var panel:Table = getChildByName("table" + (index + 1)) as Table;				if (panel) {					panel.initRound(table);				}			});			ready();		}				public function doTurn(dices)		{									var player:Player = _players[_currentPlayer];			diceGround.setup(player);			diceGround.addEventListener(MouseEvent.CLICK, doRoll);		}				public function doRoll(e:MouseEvent)		{			diceGround.roll();			diceGround.removeEventListener(MouseEvent.CLICK, doRoll);			_tables.forEach(function (table:Table, _, $) {				table.addEventListener(MouseEvent.CLICK, invest);			});		}				public function invest(e:MouseEvent)		{			var table:Table = e.currentTarget as Table;			var dices:Vector.<Dice> = diceGround.popDices(table.number);						if (dices.length == 0) return;						table.buy(_players[_currentPlayer], dices);						_tables.forEach(function (table:Table, _, $) {				table.removeEventListener(MouseEvent.CLICK, invest);			});						var index:int = (_currentPlayer + 1) % _players.length;			while (_players[index].diceCount == 0 && index != _currentPlayer) {				index = (index + 1) % _players.length;			}			if (index == _currentPlayer && _players[index].diceCount == 0) {				_tables.forEach(function (table:Table, _, $) {					table.givePrize();					table.reset();				});				if (_round <= 4) {					_players.forEach(function (player:Player, _, $) {						player.diceCount = 8;					});					roundTextField.text = "Round " + _round + "/4";				} else {					gotoAndPlay(1, "Winner");					_players.forEach(function (player:Player, index:int, $) {						player.x = 100;						player.y = 300 + index * 100;						player.width = 500;						player.height = 100;						addChild(player);					});										restartButton.addEventListener(MouseEvent.CLICK, function (e:MouseEvent) {						gotoAndPlay(1, "Game");						onEnterGameScene();					});						return;				}							} else {				_currentPlayer = index;			}			doTurn();		}	}	}