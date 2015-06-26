var bitcore = require('bitcore');
var $ = bitcore.util.preconditions;
var Opcode = bitcore.Opcode;
var Networks = bitcore.Networks;
var Transaction = bitcore.Transaction;
var Script = bitcore.Script;
var script = require('./lib/script');
var names = require('./lib/names');
var constants = require('./lib/constants');
var NameInput = require('./lib/nameinput');

/**
 * Set up bitcore specific constants, version numbers,
 * and helper functions for working with namecoin. Variables
 * and functions are put directly onto the bitcore instance.
 */

// disable warning about the NMC fees being too high
Transaction.FEE_SECURITY_MARGIN = constants.NMC_FEE_SECURITY_MARGIN;

// add nmc-specific opcodes ...
Opcode.map['OP_NAME_NEW'] = constants.NAME_NEW_OPCODE;
Opcode.map['1'] = constants.NAME_NEW_OPCODE;
Opcode.OP_NAME_NEW = constants.NAME_NEW_OPCODE;

Opcode.map['OP_NAME_FIRSTUPDATE'] = constants.NAME_FIRSTUPDATE_OPCODE;
Opcode.map['2'] = constants.NAME_FIRSTUPDATE_OPCODE;
Opcode.OP_NAME_FIRSTUPDATE = constants.NAME_FIRSTUPDATE_OPCODE;

Opcode.map['OP_NAME_UPDATE'] = constants.NAME_UPDATE_OPCODE;
Opcode.map['3'] = constants.NAME_UPDATE_OPCODE;
Opcode.OP_NAME_UPDATE = constants.NAME_UPDATE_OPCODE;

// Namecoin:
// Version Bytes:
// https://en.bitcoin.it/wiki/Base58Check_encoding
var networkNamecoin = Networks.add({
  name: 'namecoin',
  alias: 'namecoin',
  // https://github.com/namecoin/namecore/commit/4b33389f2ed7809404b1a96ae358e148a765ab6f
  pubkeyhash: 0x34,
  privatekey: 0xB4,
  scripthash: 13,
  // xpubkey: 0x043587cf,
  // xprivkey: 0x04358394,
  // xpubkey: null, // HD extended pubkey (nonexistant in namecoin o.g.)
  // xprivkey: null, // HD extended privkey (nonexistant in namecoin o.g.)
  networkMagic: 0xf9beb4fe,
  port: 8334,
  dnsSeeds: [
    'nmc.seed.quisquis.de',
    'namecoindnsseed.digi-masters.com',
    'namecoindnsseed.digi-masters.uk',
    'dnsseed.namecoin.webbtc.com'
  ]
});

// networkNamecoin.namecoin = networkNamecoin;

// overload bitcore-s namecoin-rejecting script
// serializing function with one that first handles
// namecoin scripts or passes control to the original
// bitcore implementation if no name script it detected.
Script.fromString = script.fromStringNmc;

Script.prototype.isNameOut = function() {
  return this.isNameNew() || this.isNameFirstUpdate() || this.isNameUpdate();
};

Script.prototype.getPublicKeyHashName = function() {
  $.checkState(this.isNameNew() ||
               this.isNameFirstUpdate() ||
               this.isNameUpdate(), 'Non-Namecoin script output');
  // TODO: sanity check on pubKey hash length / type
  // otherwise the errors moving forward are cryptic
  switch(this.chunks[0].opcodenum) {
  case Opcode.OP_NAME_NEW:
    return this.chunks[5].buf;
  case Opcode.OP_NAME_FIRSTUPDATE:
    return this.chunks[8].buf;
  case Opcode.OP_NAME_UPDATE:
    return this.chunks[7].buf;
  default:
    throw new Error('Non-Namecoin script output');
  }
};

Script.prototype.isNameNew = function() {
  return this.chunks[0].opcodenum === Opcode.OP_NAME_NEW;
};

Script.prototype.isNameFirstUpdate = function() {
  return this.chunks[0].opcodenum === Opcode.OP_NAME_FIRSTUPDATE;
};

Script.prototype.isNameUpdate = function() {
  return this.chunks[0].opcodenum === Opcode.OP_NAME_UPDATE;
};

Transaction.prototype._fromNonP2SH = NameInput.patchFromNonP2SH; //patchFromNonP2SH;
Transaction.Input.NameInput = require('./lib/nameinput.js');

// Add name_* functionality with chaining to Transaction
Transaction.prototype.nameNew = names.nameNew;
Transaction.prototype.nameFirstUpdate = names.nameFirstUpdate;
Transaction.prototype.nameUpdate = names.nameUpdate;

module.exports = bitcore;
