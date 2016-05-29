const shuffle = require('./array').shuffle;
const GameRoom = require('./room').GameRoom;

module.exports.LasVegas = class LasVegas extends GameRoom
{
  get TotalRound() { return 4; }
  get TableNames() { return [1, 2, 3, 4, 5, 6]; }
  get DiceCount() { return 8; }
  get MaxPrize() { return 5; }
  
  constructor(server) {
    super(server);
    this.onAllReady = this.init;
  }
  
  static createGame(server) { return new LasVegas(server); }

  invest(id, message) {
    if (this.currentPlayer.id == id) {
      let funds = this.currentPlayer.dices.filter(dice => dice == message.table);
      console.log(`Dices [${this.currentPlayer.dices.join(',')}] invest [${funds.join(',')}]`);
      this.currentPlayer.diceCount -= this.currentPlayer.dices.count;
      delete this.currentPlayer.dices;
      this.broadcast({ cmd: 'invested', player: this.currentPlayer, table: message.table, dices: funds, game: this });
      this.onAllReady = this.nextPlayer;
    }  
  }
  
  gameover() {
    this.broadcast({ cmd: 'result' });
  }
  
  nextPlayer() {
    console.log('Running nextPlayer()');
    
    if (this.currentPlayer) {
      console.log(`currentPlayer = ${JSON.stringify(this.currentPlayer)}`);
      let nextPlayer = (this.players.findIndex(player => player == this.currentPlayer) + 1) % this.players.length;
      console.log(`nextPlayer = ${nextPlayer}`);
      let nextCandidates = this.players.slice(0, nextPlayer).concat(this.players.slice(nextPlayer)).filter(player => player.diceCount > 0);
      console.log(`nextCandidates = ${nextCandidates.join(',')}`);
      this.currentPlayer = (nextCandidates.count > 0) ? nextCandidates[0] : null;
      console.log(`currentPlayer = ${JSON.stringify(this.currentPlayer)}`);
    } else {
      this.currentPlayer = this.players[0];
    }
          
    if (this.currentPlayer) {
      this.broadcast({ cmd: 'nextPlayer', player: this.currentPlayer, game: this });
      this.onAllReady = this.roll;
    } else {
      this.broadcast({ cmd: 'result', game: this });
      if (++this.currentRound == this.TotalRound)
        this.onAllReady = this.gameOver;
      else
        this.onAllReady = this.initRound;
    }
  }
  
  roll() {
    console.log('Running roll()');
    function* rollDices(diceCount, TableCount) {
      while (--diceCount >= 0) {
        yield Math.floor(Math.random() * TableCount) + 1;
      }
    }
    this.currentPlayer.dices = [...rollDices(this.currentPlayer.diceCount, this.TableNames.length)].sort((lhs, rhs) => lhs - rhs); 
    console.log(`Player ${this.currentPlayer.id} rolls ${this.currentPlayer.dices}`);
    this.send({ cmd: 'roll', player: this.currentPlayer }, this.currentPlayer.id);
  }
    
  initRound() {
    console.log('Running initRound()');
    var round = { tables: {} };
    this.rounds.push(round);
    
    function* setupTable(prizes, MaxPrize) {
      var totalPrize = 0; 
      do {
        var prize = prizes.pop();
        yield prize;
        totalPrize += prize;
      } while (totalPrize < MaxPrize);
    }
    for (var name of this.tables) {
      round.tables[name] = {
        name: name,
        prizes: [...setupTable(this.prizes, this.MaxPrize)].sort((lhs, rhs) => rhs - lhs)
      }
    }
    
    this.players.forEach(player => player.diceCount = 8);
    this.currentRound = round;
    this.broadcast({ cmd: 'initRound', game: this });
    this.onAllReady = this.nextPlayer;
  }
  
  init() {
    console.log('Running init()');
    this.rounds = [];
    this.players = shuffle(Array.from(this.members, x => Object.assign(x[1], { score: 0 } )));
    this.prizes = [];
    [6, 8, 8, 6, 6, 5, 5, 5, 5].forEach((count, prize) => {
      for (var index = 0; index < count; ++index) 
        this.prizes.push(prize + 1);  
    });
    shuffle(this.prizes);
    
    this.tables = this.TableNames;        
    this.broadcast({ cmd: 'gameStart', game: this });
    this.onAllReady = this.initRound;
  }

  toJSON() {
    return { 
      rounds: this.rounds,  
      players: this.players,
      tables: this.tables
    };
  }
};