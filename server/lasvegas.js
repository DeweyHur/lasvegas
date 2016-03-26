import { shuffle } from './array'
import { GameRoom } from './room'

export class LasVegas extends GameRoom
{
  get TotalRound() { return 4; }
  get TableCount() { return 6; }
  get MaxPrize() { return 5; }
  
  constructor(server) {
    super(server);
  }

  gameover() {
    this.broadcast({ cmd: 'result' });
  }

  initRound() {
    var round = { tables: [] };
    this.game.rounds.push(round);
    
    for (var index = 0; index < this.TableCount; ++index) {
      var table = { prizes: [] };
      round.tables.push(table);
      do {
        table.prizes.push(this.game.prizes.pop());
      } while (table.prizes.reduce((prev, cur) => prev + cur) < this.MaxPrize);
      table.prizes.sort((lhs, rhs) => rhs - lhs);
    }
    return round;
  }

  init() {
    this.game = { rounds: [], prizes: [], players: [] };
    [6, 8, 8, 6, 6, 5, 5, 5, 5].forEach((count, prize) => {
      for (var index = 0; index < count; ++index) 
        this.game.prizes.push(prize + 1);  
    });
    shuffle(this.game.prizes);
    
    this.currentRound = this.initRound();
    this.broadcast({ cmd: 'round', game: this.game })    
  }
};