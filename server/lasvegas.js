import { shuffle } from './array'
import { GameRoom } from './room'

export class LasVegas extends GameRoom
{
  get TotalRound() { return 4; }
  get TableCount() { return 6; }
  get DiceCount() { return 8; }
  get MaxPrize() { return 5; }
  
  constructor(server) {
    super(server);
    
    this.roll = () => {
      console.log('Running roll()');
      function* rollDices(diceCount, TableCount) {
        while (--diceCount >= 0) 
          yield Math.floor(Math.random() * TableCount) + 1;
      }
      this.currentPlayer.dices = [...rollDices(this.currentPlayer.diceCount, this.TableCount)]; 
      console.log(`Player ${this.currentPlayer.id} rolls ${this.currentPlayer.dices}`);
      this.send({ cmd: 'roll', dices: this.currentPlayer.dices }, this.currentPlayer.id);
      this.onAllReady = this.dices;
    };
    
    this.initRound = () => {
      console.log('Running initRound()');
      var round = { tables: [] };
      this.rounds.push(round);
      
      function* setupTables(prizes, MaxPrize, TableCount) {
        function* setupTable(prizes, MaxPrize) {
          var totalPrize = 0; 
          do {
            var prize = prizes.pop();
            yield prize;
            totalPrize += prize;
          } while (totalPrize < MaxPrize);
        }
        
        while (--TableCount >= 0) {
          var table = { prizes: [...setupTable(prizes, MaxPrize)] };
          table.prizes.sort((lhs, rhs) => rhs - lhs);
          yield table;
        }
      }
      round.tables = [...setupTables(this.prizes, this.MaxPrize, this.TableCount)]; 
      
      this.players.forEach(player => player.diceCount = 8);
      this.currentRound = round;
      this.currentPlayer = this.currentPlayer || this.players[0];
      console.log(`Current Player: ${JSON.stringify(this.currentPlayer)}`);
      this.broadcast({ cmd: 'initRound', game: this.toJson() });
      this.onAllReady = this.roll;
    };
    
    this.init = () => {
      console.log('Running init()');
      this.rounds = [];
      this.players = shuffle(Array.from(this.members, x => Object.assign(x[1], { score: 0 } )));
      this.prizes = [];
      [6, 8, 8, 6, 6, 5, 5, 5, 5].forEach((count, prize) => {
        for (var index = 0; index < count; ++index) 
          this.prizes.push(prize + 1);  
      });
      shuffle(this.prizes);
      
      this.broadcast({ cmd: 'gameStart', game: this.toJson() });
      this.onAllReady = this.initRound;        
    };
    
    this.onAllReady = this.init;
  }
  
  static createGame(server) { return new LasVegas(server); }

  gameover() {
    this.broadcast({ cmd: 'result' });
  }

  toJson() {
    return { 
      rounds: this.rounds,  
      players: this.players,
      tables: this.tables
    };
  }
};