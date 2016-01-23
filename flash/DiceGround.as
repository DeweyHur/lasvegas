package 
{
	import flash.display.MovieClip;
	import flash.display.Sprite;
	/**
	 * ...
	 * @author Dewey Hur
	 */
	public class DiceGround extends MovieClip
	{
		public var diceArea:MovieClip;
		
		protected var _dices:Vector.<Dice> = new Vector.<Dice>();
		protected var _diceValues:Array;
		protected var _player:Player;
		protected var self = this;
		
		public function DiceGround() 
		{			
		}
		
		public function setup(player:Player)
		{
			_dices.forEach(function (dice:Dice, _, $):void
			{
				diceArea.removeChild(dice);
			});
			
			_player = player;
			_dices = new Vector.<Dice>();
			var x:int = 0;
			for (var index:int = 0; index < player.diceCount; ++index)
			{
				var dice:Dice = new Dice();
				dice.x = x;
				dice.y = 0;
				dice.color = player.color;
				diceArea.addChild(dice);
				_dices.push(dice);
				
				x += 25;
			}
		}
		
		public function roll()
		{
			var values:Array = [0, 0, 0, 0, 0, 0];
			_dices.forEach(function (dice:Dice, _, $) {
				++values[Math.floor(Math.random() * 6)];
			});
			
			_diceValues = [0];
			values.forEach(function (value:int, _, $) {
				_diceValues.push(_diceValues[_diceValues.length - 1] + value);
			});
			
			var valueIndex:int = 0;
			for (var index:int = 0; index < _dices.length; ++index)
			{
				while (values[valueIndex] == 0) ++valueIndex;
				--values[valueIndex];
				_dices[index].gotoAndStop(valueIndex + 1);
			}
		}
		
		public function popDices(value:int):Vector.<Dice>
		{
			var count:int = _diceValues[value] - _diceValues[value - 1];			
			_player.diceCount -= count;
			return _dices.splice(_diceValues[value - 1], count);
		}
	}
}