var bitcore = require('bitcore');
var bitcoreNamecore = require('./lib/namecoin');
bitcore.Namecoin = bitcoreNamecore;

module.exports = bitcore.Namecoin;
