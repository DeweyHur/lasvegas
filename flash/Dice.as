package  {
	
	import fl.motion.Color;
	import flash.display.MovieClip;
	import flash.display.Shape;
	
	
	public class Dice extends MovieClip {
		protected var square:Shape = new Shape();
		
		public function Dice()
		{
			addChildAt(square, 0);
		}
		
		public function set color(value:uint)
		{
			square.graphics.beginFill(value);
			square.graphics.drawRect(0, 0, 25, 25);
		}
	}	
}
