package  {
	
	import com.greensock.easing.Expo;
	import com.greensock.TweenNano;
	import fl.motion.Color;
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.geom.Point;
	import flash.text.TextField;	
	
	public class Table extends MovieClip 
	{
		public var id:Dice;
		
		protected var _number:int;		
		protected var _stakes:Array;
		protected var _prizes:Array;
		protected var _diceArea:Sprite = new Sprite();
		protected var _prizeArea:Sprite = new Sprite();

		public function Table()
		{
			addChild(_diceArea);
			addChild(_prizeArea);
			_prizeArea.x = 150;
		}
		
		public function setup(tableNumber:int, players:Vector.<Player>)
		{
			_stakes = [];
			_number = tableNumber;
			id.gotoAndStop(number);
			players.forEach(function (player:Player, index:int, $) {				
				var area:Sprite = new Sprite();				
				_diceArea.addChild(area);
				_stakes.push( { player: player, dices:new Vector.<Dice>(), area:area } );
			});
			
			reset();
		}
		
		public function reset()
		{
			_prizeArea.removeChildren();
			
			_stakes.forEach(function (info, index:int, $) {
				info.dices = new Vector.<Dice>();
				info.area.removeChildren();
			});
			
			var totalPrize:int = 0;
			var prizeY:Number = 0;
			_prizes = [];
			while (totalPrize < 5) {
				var prize:int = Math.floor(Math.random() * 9 + 1);
				totalPrize += prize;
				
				var prizeTextField:TextField = new TextField();
				prizeTextField.x = 0;
				prizeTextField.width = 50;
				prizeTextField.height = 25;
				prizeTextField.text = "$" + prize + "0,000";
				prizeTextField.textColor = 0x000000;
				_prizeArea.addChild(prizeTextField);
				_prizes.push({ prize: prize, textField: prizeTextField });				
			}
			_prizes = _prizes.sort(function (lhs, rhs):int {
				return rhs.prize - lhs.prize;
			});
			_prizes.forEach(function (info, index:int, $) {
				info.textField.y = index * 25;
			});
			
		}
		
		public function get number():int { return _number; }		
		
		public function buy(player:Player, dices:Vector.<Dice>)
		{
			var info = null;
			for (var index:int = 0; index < _stakes.length; ++index) {
				if (_stakes[index].player == player) {
					info = _stakes[index];
					break;
				}						
			}
			if (info == null)
				return;
				
			dices.forEach(function (dice:Dice, index:int, $) {
				TweenNano.to(dice, 0.5, { x: info.dices.length * 25, delay: index * 0.25, ease: Expo.easeOut } );
				info.dices.push(dice);
				info.area.addChild(dice);
			});
			
			_stakes = _stakes.sort(function (lhs, rhs):int {
				return rhs.dices.length - lhs.dices.length;
			});
			
			_stakes.forEach(function (stake, index:int, $) {
				TweenNano.to(stake.area, 0.5, { y: index * 25, ease: Expo.easeOut } );
			});
			
			var stakes:Array = extractValidStakes();
			_prizes.forEach(function (info, index:int, $) {
				if (index < stakes.length && stakes[index].dices.length > 0)
					info.textField.textColor = stakes[index].player.color;
				else
					info.textField.textColor = 0x000000;
			});
		}
		
		protected function extractValidStakes():Array
		{
			var diceCounts = {};
			_stakes.forEach(function (stake, index:int, $) {
				if (diceCounts[stake.dices.length] === undefined)
					diceCounts[stake.dices.length] = 1;
				else
					++diceCounts[stake.dices.length];
			});
			
			var stakes:Array = [];
			for (var count in diceCounts) {
				if (diceCounts[count] == 1) {
					for (var index:int = 0; index < _stakes.length; ++index) {
						if (_stakes[index].dices.length == count) {
							stakes.push(_stakes[index]);
							break;
						}
					}
				}
			}			
			
			stakes = stakes.sort(function (lhs, rhs):int {
				return rhs.dices.length - lhs.dices.length;
			});
			return stakes;
		}
		
		public function givePrize()
		{
			var stakes:Array = extractValidStakes();
			_prizes.forEach(function (info, index:int, $) {
				if (index < stakes.length && stakes[index].dices.length > 0)
					stakes[index].player.score += info.prize;
			});			
		}
	}	
}
