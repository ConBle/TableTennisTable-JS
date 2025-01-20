const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const fs = require('fs');
const app = require('../../src/app');
const gameState = require('../../src/league');

describe('league app', function () {
let game;

  beforeEach(() => {
    game = app.startGame(gameState.createLeague());
  });

  it('prints empty game state', function () {
    expect(game.sendCommand('print')).to.equal('No players yet');
  });

  it('returns null after \'winner\' command on empty game state', function() {
    expect(game.sendCommand('winner')).to.equal(null);
  })

  it('prints one player game state', function () {
    game.sendCommand('add player PlayerName')

    expect(game.sendCommand('print')).to.equals(
      '-------------------\n|   PlayerName    |\n-------------------'
    );
  })

  it('prints three player game state', function () {
    game.sendCommand('add player Player1');
    game.sendCommand('add player Player2');
    game.sendCommand('add player Player3');

    expect(game.sendCommand('print')).to.equals(
      '          -------------------\n'
      + '          |     Player1     |\n'
      + '          -------------------\n'
      + '------------------- -------------------\n'
      + '|     Player2     | |     Player3     |\n'
      + '------------------- -------------------'
    );
  })

  it('prints error on invalid player name', function () {    
    expect(game.sendCommand('add player !')).to.equal('Player name ! contains invalid characters');
    expect(game.sendCommand('print')).to.equal('No players yet');
  })

  it('executes game win', function () {
    game.sendCommand('add player Player1');
    game.sendCommand('add player Player2');

    expect(game.sendCommand('winner')).to.equal('Player1');
    expect(game.sendCommand('record win Player2 Player1'));
    expect(game.sendCommand('winner')).to.equal('Player2');
  })

  it('prints error after \'record win\' command, when winner is above loser', function() {
    game.sendCommand('add player Player1');
    game.sendCommand('add player Player2');

    expect(game.sendCommand('record win Player1 Player2')).to.equal('Cannot record match result. Winner \'Player1\' must be one row below loser \'Player2\'');
  })

  it('prints error after \'record win\' command, when winner is two rows below loser', function() {
    game.sendCommand('add player Player1');
    game.sendCommand('add player Player2');
    game.sendCommand('add player Player3');
    game.sendCommand('add player Player4');

    expect(game.sendCommand('record win Player4 Player1')).to.equal('Cannot record match result. Winner \'Player4\' must be one row below loser \'Player1\'');
  })

  it('print error on attempt to record win with non-existent player', function () {
    game.sendCommand('add player Player1')

    expect(game.sendCommand('record win Player2 Player1')).to.equal('Player \'Player2\' is not in the game');
  })

  it('prints error after \'record win\' command, when winner and loser are the same player', function() {
    game.sendCommand('add player Player1');

    expect(game.sendCommand('record win Player1 Player1')).to.equal('Cannot record match result. Winner \'Player1\' must be one row below loser \'Player1\'')
  })

  it('prints error after incorrect command', function() {
    expect(game.sendCommand('Hello World!')).to.equal('Unknown command "Hello World!"')
  })
});

describe('league app', function () {
  it('loads in existing league', function() {
    const readFileSyncStub = sinon.stub(fs, 'readFileSync');
    readFileSyncStub.withArgs('fileName.fileType', 'utf8').returns(JSON.stringify([['Player1'], ['Player2', 'Player3']]))
    
    const game = app.startGame();
    game.sendCommand('load fileName.fileType')
    
    expect(game.sendCommand('print')).to.equals(
      '          -------------------\n'
      + '          |     Player1     |\n'
      + '          -------------------\n'
      + '------------------- -------------------\n'
      + '|     Player2     | |     Player3     |\n'
      + '------------------- -------------------'
    );
    
    readFileSyncStub.restore();
  });

  it('saves league', function() {
    const fsMock = this.sinon.mock(fs);
    fsMock.expects('writeFileSync').once().withArgs('fileName.fileType',
      JSON.stringify([['Player1'], ['Player2', 'Player3']]),
      { flag: 'w' }
    )

    const game = app.startGame(gameState.createLeague());
    game.sendCommand('add player Player1');
    game.sendCommand('add player Player2');
    game.sendCommand('add player Player3');
    game.sendCommand('save fileName.fileType')
    
    fsMock.verify();
  })
});
