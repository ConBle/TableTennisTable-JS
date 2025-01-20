const fs = require('fs');
const gameState = require('./league');
const InvalidArgumentException = require('./invalid_argument_exception');

exports.save = function (path, league) {
  const players = league.getPlayers();
  try {
    fs.writeFileSync(path, JSON.stringify(players), { flag: 'w' });
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new InvalidArgumentException(`Could not save file to ${path}`);
    }
    throw e;
  }
};

exports.load = function (path) {
  try {
    const state = gameState.load(JSON.parse(fs.readFileSync(path, 'utf8')));
    
    console.log(state);
    return state;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new InvalidArgumentException(`File is not valid JSON: ${path}`);
    }
    if (e.code === 'ENOENT') {
      throw new InvalidArgumentException(`Could not load file from ${path}`);
    }
    throw e;
  }
};
