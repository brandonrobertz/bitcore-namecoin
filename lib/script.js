'use strict';
var bitcore = require('bitcore');
var Opcode = bitcore.Opcode;
var Script = bitcore.Script;
var BufferReader = bitcore.encoding.BufferReader;
var BufferWriter = bitcore.encoding.BufferWriter;
var bufferTools = bitcore.util.buffer;

/**
 * Get the correct varstr encoding for given string.
 */
var scriptPushOp = function(data) {
  var pushOpcode;
  var stringLength = data.length / 2;
  if (stringLength <= 252) {
    pushOpcode = Opcode.OP_PUSHDATA1;
  } else if (stringLength <= 0xffff) {
    pushOpcode = Opcode.OP_PUSHDATA2;
  } else {
    pushOpcode = Opcode.OP_PUSHDATA4;
  }
  return {
    opcodenum: pushOpcode
  };
};

/**
 * Generate a bitcore "push data" data/object chunk
 * bitcoin varString encoding.
 */
var scriptStrBuf = function(data) {
  var stringLength = data.length / 2;
  var len;
  var opcode;
  var bw = new BufferWriter();
  if (data.length <= 252) {
    bw.writeUInt8(stringLength);
    opcode = stringLength;
  } else if (stringLength <= 252) {
    bw.writeUInt8(stringLength);
    opcode = Opcode.OP_PUSHDATA1;
  } else if (stringLength <= 0xffff) {
    bw.writeUInt16LE(data.length);
    opcode = Opcode.OP_PUSHDATA2;
  } else {
    bw.writeUInt32LE(data.length);
    opcode = Opcode.OP_PUSHDATA4;
  }
  len = bufferTools.bufferToHex(bw.bufs[0]);
  var chunk = {
    buf: new Buffer(data, 'hex'),
    len: stringLength,
    opcodenum: opcode
  };
  return chunk;
};

/**
 * Generate bitcore script data/opcode object
 * for static length hex-encoded data.
 */
var scriptHexBuf = function(data) {
  return {
    buf: new Buffer(data, 'hex'),
    len: data.length,
    opcodenum: data.length
  };
};

/**
 * Generate bitcore script opcode object
 * representing a single opcode.
 */
var scriptOpcode = function(data) {
  var opcodenum = Opcode(data).toNumber();
  return {
    opcodenum: opcodenum
  };
};

/**
 * Take a chunk of ASM string parts and deteriming whether or not we're
 * given a valid name new ASM script.
 */
var isNameNew = function(strChunks){
  return strChunks.length === 8 &&
    ( Opcode(strChunks[0]).toNumber() === Opcode.OP_NAME_NEW ||
      Opcode(strChunks[0]).toNumber() === Opcode.OP_1 ) &&
    strChunks[1].match( '[a-f0-9]{40}')  &&
    Opcode(strChunks[2]).toNumber() === Opcode.OP_2DROP &&
    Opcode(strChunks[3]).toNumber() === Opcode.OP_DUP &&
    Opcode(strChunks[4]).toNumber() === Opcode.OP_HASH160 &&
    strChunks[5].match( '[a-f0-9]{40}')  &&
    Opcode(strChunks[6]).toNumber() === Opcode.OP_EQUALVERIFY &&
    Opcode(strChunks[7]).toNumber() === Opcode.OP_CHECKSIG;
};

/**
 * Take a chunk of ASM string parts and deteriming whether or not we're
 * given a valid name first update ASM script.
 */
var isNameFirstUpdate = function(strChunks){
  return strChunks.length === 11 &&
    ( Opcode(strChunks[0]).toNumber() === Opcode.OP_NAME_FIRSTUPDATE ||
      Opcode(strChunks[0]).toNumber() === Opcode.OP_2 ) &&
    strChunks[1].match( '[a-f0-9]{1,255}')  &&
    strChunks[2].match( '[a-f0-9]{16}')  &&
    strChunks[3].match( '[a-f0-9]{1,1024}')  &&
    Opcode(strChunks[4]).toNumber() === Opcode.OP_2DROP &&
    Opcode(strChunks[5]).toNumber() === Opcode.OP_2DROP &&
    Opcode(strChunks[6]).toNumber() === Opcode.OP_DUP &&
    Opcode(strChunks[7]).toNumber() === Opcode.OP_HASH160 &&
    strChunks[8].match( '[a-f0-9]{40}')  &&
    Opcode(strChunks[9]).toNumber() === Opcode.OP_EQUALVERIFY &&
    Opcode(strChunks[10]).toNumber() === Opcode.OP_CHECKSIG;
};

/**
 * Take a chunk of ASM string parts and deteriming whether or not we're
 * given a valid name update ASM script.
 */
var isNameUpdate = function(strChunks){
  return strChunks.length === 10 &&
    ( Opcode(strChunks[0]).toNumber() === Opcode.OP_NAME_UPDATE ||
      Opcode(strChunks[0]).toNumber() === Opcode.OP_3 ) &&
    strChunks[1].match( '[a-f0-9]{1,255}')  &&
    strChunks[2].match( '[a-f0-9]{1,1024}')  &&
    Opcode(strChunks[3]).toNumber() === Opcode.OP_2DROP &&
    Opcode(strChunks[4]).toNumber() === Opcode.OP_DROP &&
    Opcode(strChunks[5]).toNumber() === Opcode.OP_DUP &&
    Opcode(strChunks[6]).toNumber() === Opcode.OP_HASH160 &&
    strChunks[7].match( '[a-f0-9]{40}')  &&
    Opcode(strChunks[8]).toNumber() === Opcode.OP_EQUALVERIFY &&
    Opcode(strChunks[9]).toNumber() === Opcode.OP_CHECKSIG;
};


/**
 * Take a list of ASM script opcode chunks
 * and return a list of objects used to generate
 * a valid serialized name_new script.
 */
var parseNameNew = function(chunks){
  return [
    scriptOpcode(chunks[0]),
    scriptStrBuf(chunks[1]),
    scriptOpcode(chunks[2]),
    scriptOpcode(chunks[3]),
    scriptOpcode(chunks[4]),
    scriptStrBuf(chunks[5]),
    scriptOpcode(chunks[6]),
    scriptOpcode(chunks[7]) ];
};

/**
 * Take a list of ASM script opcode chunks
 * and return a list of objects used to generate
 * a valid serialized name_firstupdate script.
 */
var parseNameFirstUpdate = function(chunks){
  return [
    scriptOpcode(chunks[0]),
    scriptStrBuf(chunks[1]),
    scriptStrBuf(chunks[2]),
    scriptStrBuf(chunks[3]),
    scriptOpcode(chunks[4]),
    scriptOpcode(chunks[5]),
    scriptOpcode(chunks[6]),
    scriptOpcode(chunks[7]),
    scriptStrBuf(chunks[8]),
    scriptOpcode(chunks[9]),
    scriptOpcode(chunks[10]) ];
};

/**
 * Take a list of ASM script opcode chunks
 * and return a list of objects used to generate
 * a valid serialized name_update script.
 */
var parseNameUpdate = function(chunks){
  return [
    scriptOpcode(chunks[0]),
    scriptStrBuf(chunks[1]),
    scriptStrBuf(chunks[2]),
    scriptOpcode(chunks[3]),
    scriptOpcode(chunks[4]),
    scriptOpcode(chunks[5]),
    scriptOpcode(chunks[6]),
    scriptStrBuf(chunks[7]),
    scriptOpcode(chunks[8]),
    scriptOpcode(chunks[9]) ];
};

/**
 * Convert an ASM script string and convert
 * it into a bitcore Script instance.
 */
var parseNameScript = function(str) {
  var chunks = str.split(' ');
  var script = new bitcore.Script();
  var parsed;
  if (isNameNew(chunks)) {
    parsed = parseNameNew(chunks);
  } else if (isNameFirstUpdate(chunks)) {
    parsed = parseNameFirstUpdate(chunks);
  } else if (isNameUpdate(chunks)){
    parsed = parseNameUpdate(chunks);
  } else {
    throw new Error( 'Invalid Name Script');
  }
  script.chunks = parsed;
  return script;
};

/**
 * Take an ASM string script and determine whether or not
 * we've got a name script.
 */
var isNameScript = function(str) {
  var chunks = str.split(' ');
  return isNameNew(chunks) ||
    isNameFirstUpdate(chunks) ||
    isNameUpdate(chunks);
};

/**
 * An overlay function for interpreting scripts in
 * the string-representation. This is used as a monkey
 * patch over bitcore.Script.fromString
 */
var fromStringNmc = (function(){
  var originalFromString = Script.fromString;
  return function(str) {
    // test if namecoin operation
    if (isNameScript(str)) {
      return parseNameScript( str);
    } else {
      // otherwise, execute old code
      return originalFromString( str);
    }
  };
})();

module.exports = {
  fromStringNmc: fromStringNmc
};
