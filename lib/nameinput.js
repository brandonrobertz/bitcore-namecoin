'use strict';

var inherits = require('inherits');
var bitcore = require('bitcore');

var $ = bitcore.util.preconditions;
var BufferUtil = bitcore.util.buffer;

var Hash = bitcore.crypto.Hash;
var Input = bitcore.Transaction.Input;
var Output = bitcore.Transaction.Output;
var Sighash =  bitcore.Transaction.sighash;
var Script = bitcore.Script;
var Signature = bitcore.crypto.Signature;
var TransactionSignature = bitcore.Transaction.Signature;
var PublicKeyHashInput = bitcore.Transaction.Input.PublicKeyHash
var Transaction = bitcore.Transaction;

/**
 * Represents a special kind of input of NameInput kind.
 * @constructor
 */
function NameInput() {
  Input.apply(this, arguments);
}
inherits(NameInput, Input);

/* jshint maxparams: 5 */
/**
 * @param {Transaction} transaction - the transaction to be signed
 * @param {PrivateKey} privateKey - the private key with which to sign the transaction
 * @param {number} index - the index of the input in the transaction input vector
 * @param {number=} sigtype - the type of signature, defaults to Signature.SIGHASH_ALL
 * @param {Buffer=} hashData - the precalculated hash of the public key associated with the privateKey provided
 * @return {Array} of objects that can be
 */
NameInput.prototype.getSignatures = function(transaction, privateKey, index, sigtype, hashData) {
  $.checkState(this.output instanceof Output);
  hashData = hashData || Hash.sha256ripemd160(privateKey.publicKey.toBuffer());
  sigtype = sigtype || Signature.SIGHASH_ALL;

  if (BufferUtil.equals(hashData, this.output.script.getPublicKeyHashName())) {
    return [new TransactionSignature({
      publicKey: privateKey.publicKey,
      prevTxId: this.prevTxId,
      outputIndex: this.outputIndex,
      inputIndex: index,
      signature: Sighash.sign(transaction, privateKey, sigtype, index, this.output.script),
      sigtype: sigtype
    })];
  }
  return [];
};
/* jshint maxparams: 3 */

/**
 * Add the provided signature
 *
 * @param {Object} signature
 * @param {PublicKey} signature.publicKey
 * @param {Signature} signature.signature
 * @param {number=} signature.sigtype
 * @return {NameInput} this, for chaining
 */
NameInput.prototype.addSignature = function(transaction, signature) {
  $.checkState(this.isValidSignature(transaction, signature), 'Signature is invalid');
  this.setScript(Script.buildPublicKeyHashIn(
    signature.publicKey,
    signature.signature.toDER(),
    signature.sigtype
  ));
  return this;
};

/**
 * Clear the input's signature
 * @return {NameInput} this, for chaining
 */
NameInput.prototype.clearSignatures = function() {
  this.setScript(Script.empty());
  return this;
};

/**
 * Query whether the input is signed
 * @return {boolean}
 */
NameInput.prototype.isFullySigned = function() {
  return this.script.isPublicKeyHashIn();
};

NameInput.SCRIPT_MAX_SIZE = 73 + 34; // sigsize (1 + 72) + pubkey (1 + 33)

NameInput.prototype._estimateSize = function() {
  return PublicKeyHashInput.SCRIPT_MAX_SIZE;
};

NameInput.patchFromNonP2SH = (function(){
  var originalFn = Transaction.prototype._fromNonP2SH;
  return function(utxo) {

    if (utxo.script.isNameOut()) {
      var clazz = NameInput;
      return this.addInput(new clazz({
        output: new Output({
          script: utxo.script,
          satoshis: utxo.satoshis
        }),
        prevTxId: utxo.txId,
        outputIndex: utxo.outputIndex,
        script: Script.empty()
      }));
    } else {
      return originalFn.call(this, utxo);
    }
  };
})();

module.exports = NameInput;
