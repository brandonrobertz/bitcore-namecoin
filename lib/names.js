var nmcTx = require('namecoin-transaction');
var hash = require('crypto-hashing');
var conv = require('binstring');
var bitcore = require('bitcore');
var bufferTools = bitcore.util.buffer;
var constants = require('./constants');

/**
 * Generate a secure random hex string for use as the random
 * value in our name_new and name_firstupdate scripts.
 */
function makeRandom() {
  var rnd = secureRandom.randomBuffer(16);
  return bufferTools.bufferToHex(rnd);
}

/**
 * Build an output for a name_* operation. This is a
 * low level interface meant for direct import into
 * a Trasnaction.addOutput() call afterward.
 * @param {Number} satoshis - Amount of satoshis to spend
 * @param {Script} script - The proper name_* script
 */
function makeOutput( json){
  return new bitcore.Transaction.Output({
    satoshis: Number(json.satoshis),
    script: new bitcore.Script(json.script)
  });
}

/**
 * Hash function for creating name_new transactions
 */
function hash160(value){
  return hash.ripemd160(hash.sha256(value));
}

/**
 * Add a name_new output to a transaction. This function
 * needs to be bound to a Transaction.
 */
function nameNew( name, rand, address) {
  if (!rand) {
    throw new Error('No random value supplied.');
  } else {
    // hash the input to ensure it's secure
    rand = hash160(conv(rand + name, {in: 'hex', out:'bytes'})).toString('hex');
  }

  var nameNewAsm = nmcTx.newName( name, rand, address);

  var nameNewOut = makeOutput({
    script: nameNewAsm,
    satoshis:  constants.NETWORK_FEE.satoshis
  });

  this.addOutput( nameNewOut);

  // txs containing name_* scripts have a different version
  this.version = 0x7100;

  return this;
}

function makeNameFirstupdate( name, value) {
  var nameFirstUpdateOut = makeOutput({
    script: nameFirstUpdate,
    satoshis:  constants.NETWORK_FEE.satoshis
  });
  console.log( 'nameFirstUpdateOut', nameFirstUpdateOut);
}

function makeNameUpdate( name, value) {
  var nameUpdateOut = makeOutput({
    script: nameUpdate,
    satoshis:  constants.NETWORK_FEE.satoshis
  });
  console.log( 'nameUpdateOut', nameUpdateOut);
}

module.exports = {
  nameNew: nameNew
};
