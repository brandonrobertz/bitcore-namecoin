var bitcore = require('bitcore');
var Opcode = bitcore.Opcode;
var Networks = bitcore.Networks;
var Transaction = bitcore.Transaction;
var Script = bitcore.Script;
var script = require('./lib/script');
var names = require('./lib/names');
var constants = require('./lib/constants');

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
Networks.add({
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
    'bitseed.xf2.org',
    'bitseed.bitcoin.org.uk',
    'dnsseed.bluematt.me',
  ]
});

// overload bitcore-s namecoin-rejecting script
// serializing function with one that first handles
// namecoin scripts or passes control to the original
// bitcore implementation if no name script it detected.
Script.fromString = script.fromStringNmc;

// Add nameNew functionality with chaining to Transaction
Transaction.prototype.nameNew = names.nameNew;

module.exports = bitcore;
