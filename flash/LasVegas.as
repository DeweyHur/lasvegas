package  {
	import fl.controls.Button;
	import fl.motion.Color;
	import flash.display.MovieClip;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.text.TextField;
	
	public class LasVegas extends MovieClip {
		public var startButton:Button;
		public var diceGround:DiceGround;
		public var roundTextField:TextField;
		public var restartButton:Button;
		
		protected var _tables:Vector.<Table> = new Vector.<Table>();
		protected var _players:Vector.<Player> = new Vector.<Player>();
		protected var _currentPlayer:int = 0;
		protected var _round = 1;
		
		public var self = this;
		
		public function LasVegas() {
			trace ("Las Vegas Started.");
			startButton.addEventListener(MouseEvent.CLICK, function (e:MouseEvent) {
				gotoAndPlay(1, "Game");
				onEnterGameScene();
			});			
		}
		
		public function onEnterGameScene()
		{
			var index;
			
			const Names:Array = ["Digitz", "RedTail", "JB", "HS"];
			const Colors:Array = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00];
			for (index = 1; index <= 4; ++index)
			{
				var player:Player = getChildByName("player" + index) as Player;
				if (player)
				{
					player.nick = Names[index - 1];
					player.score = 0;
					player.diceCount = 8;
					player.color = Colors[index - 1];
					_players.push(player);
				}
			}
			
			for (index = 1; index <= 6; ++index)
			{
				var table:Table = getChildByName("table" + index) as Table;
				if (table)
				{
					table.setup(index, _players);
					_tables.push(table);
				}				
			}
			
			_currentPlayer = 0;
			roundTextField.text = "Round " + _round + "/4";
			doTurn();			
		}
		
		public function doTurn()
		{
			var player:Player = _players[_currentPlayer];
			diceGround.setup(player);
			diceGround.addEventListener(MouseEvent.CLICK, doRoll);
		}
		
		public function doRoll(e:MouseEvent)
		{
			diceGround.roll();
			diceGround.removeEventListener(MouseEvent.CLICK, doRoll);
			_tables.forEach(function (table:Table, _, $) {
				table.addEventListener(MouseEvent.CLICK, invest);
			});
		}
		
		public function invest(e:MouseEvent)
		{
			var table:Table = e.currentTarget as Table;
			var dices:Vector.<Dice> = diceGround.popDices(table.number);			
			if (dices.length == 0) return;
			
			table.buy(_players[_currentPlayer], dices);			
			_tables.forEach(function (table:Table, _, $) {
				table.removeEventListener(MouseEvent.CLICK, invest);
			});
			
			var index:int = (_currentPlayer + 1) % _players.length;
			while (_players[index].diceCount == 0 && index != _currentPlayer) {
				index = (index + 1) % _players.length;
			}
			if (index == _currentPlayer && _players[index].diceCount == 0) {
				_tables.forEach(function (table:Table, _, $) {
					table.givePrize();
					table.reset();
				});
				++_round;
				if (_round <= 4) {
					_players.forEach(function (player:Player, _, $) {
						player.diceCount = 8;
					});
					roundTextField.text = "Round " + _round + "/4";

				} else {
					gotoAndPlay(1, "Winner");
					_players.forEach(function (player:Player, index:int, $) {
						player.x = 100;
						player.y = 300 + index * 100;
						player.width = 500;
						player.height = 100;
						addChild(player);
					});
					
					restartButton.addEventListener(MouseEvent.CLICK, function (e:MouseEvent) {
						gotoAndPlay(1, "Game");
						onEnterGameScene();
					});	
					return;
				}
				
			} else {
				_currentPlayer = index;
			}
			doTurn();
		}
	}	
}
