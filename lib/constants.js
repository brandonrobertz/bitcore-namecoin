var bitcore = require('bitcore');
var Unit = bitcore.Unit;

// CONSTANTS
module.exports = {
  // pay this on name_* ops
  NETWORK_FEE : {
    btc: 0.01,
    satoshis: new Unit.fromBTC(0.01).satoshis
  },

  // this is the tx fee itself
  TRANSACTION_FEE: {
    btc: 0.005,
    satoshis: new Unit.fromBTC(0.005).satoshis
  },

  // same as TRANSACTION_FEE, but we could add some space here
  NMC_FEE_SECURITY_MARGIN: new Unit.fromBTC(0.005).satoshis,
  NAME_NEW_OPCODE: 81,
  NAME_FIRSTUPDATE_OPCODE: 82,
  NAME_UPDATE_OPCODE: 83,

  // transactions with name_* opcodes get this version number
  NAMECOIN_TX_VERSION: 0x7100,
};
