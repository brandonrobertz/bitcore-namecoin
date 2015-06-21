'use strict';
var bitcore = require('bitcore');
var Opcode = bitcore.Opcode;
var Transaction = bitcore.Transaction;
var Script = bitcore.Script;
var Networks = bitcore.Networks;
var namecoinScript = require('./script');

// CONSTANTS
// pay this on name_* ops
var NETWORK_FEE = {
  btc: 0.01,
  satoshis: bitcore.Unit.fromBTC(0.01).satoshis
};

// this is the tx fee itself
var TRANSACTION_FEE = {
  btc: 0.005,
  satoshis: bitcore.Unit.fromBTC(0.005).satoshis
};

var NMC_FEE_SECURITY_MARGIN = TRANSACTION_FEE.satoshis;
var NAME_NEW_OPCODE = 81;
var NAME_FIRSTUPDATE_OPCODE = 82;
var NAME_UPDATE_OPCODE = 83;

/**
 * Set up bitcore specific constants, version numbers,
 * and helper functions for working with namecoin. Variables
 * and functions are put directly onto the bitcore instance.
 */

// disable warning about the NMC fees being too high
Transaction.FEE_SECURITY_MARGIN = NMC_FEE_SECURITY_MARGIN;

// add nmc-specific opcodes ...
Opcode.map['OP_NAME_NEW'] = NAME_NEW_OPCODE;
Opcode.map['1'] = NAME_NEW_OPCODE;
Opcode.OP_NAME_NEW = NAME_NEW_OPCODE;

Opcode.map['OP_NAME_FIRSTUPDATE'] = NAME_FIRSTUPDATE_OPCODE;
Opcode.map['2'] = NAME_FIRSTUPDATE_OPCODE;
Opcode.OP_NAME_FIRSTUPDATE = NAME_FIRSTUPDATE_OPCODE;

Opcode.map['OP_NAME_UPDATE'] = NAME_UPDATE_OPCODE;
Opcode.map['3'] = NAME_UPDATE_OPCODE;
Opcode.OP_NAME_UPDATE = NAME_UPDATE_OPCODE;

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
Script.fromString = namecoinScript.fromStringNmc;

module.exports = function Namecoin(){
  if (!(this instanceof Namecoin)) {
    return new Namecoin();
  }

};
