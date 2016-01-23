package {
	
	import fl.motion.Color;
	import flash.display.MovieClip;
	import flash.text.TextField;
	/**
	 * ...
	 * @author Dewey Hur
	 */
	public class Player extends MovieClip
	{
		public var nickLabel:TextField;
		public var scoreLabel:TextField;
		public var diceCountLabel:TextField;
		
		protected var _nick:String;
		protected var _score:int;
		protected var _diceCount:int;
		protected var _color:uint;
		
		public function Player() 
		{
			
		}
		
		public function get nick():String { return _nick; }
		public function get score():int { return _score; }
		public function get diceCount():int { return _diceCount; }
		public function get color():uint { return _color; }
		
		public function set nick(value:String) { _nick = value; nickLabel.text = _nick; }
		public function set score(value:int) { _score = value; scoreLabel.text = _score.toString(); }
		public function set diceCount(value:int) { _diceCount = value; diceCountLabel.text = _diceCount.toString(); }
		
		public function set color(value:uint)
		{
			_color = value;
			nickLabel.textColor = value;
			scoreLabel.textColor = value;
			diceCountLabel.textColor = value;
		}
		
		
	}

}