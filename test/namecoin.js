'use strict';
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var bitcore = require('bitcore');
var bitcoreNamecoin;
var PrivateKey = bitcore.PrivateKey;
var Opcode = bitcore.Opcode;
var Networks = bitcore.Networks;
var Script = bitcore.Script;

var bufferTools = bitcore.util.buffer;
chai.config.includeStack = true;

describe('Namecoin', function() {
  // From vanitygen:
  // Address: NAMEuWT2icj3ef8HWJwetZyZbXaZUJ5hFT
  // Privkey: 74pxNKNpByQ2kMow4d9kF6Z77BYeKztQNLq3dSyU4ES1K5KLNiz
  var wif = '74pxNKNpByQ2kMow4d9kF6Z77BYeKztQNLq3dSyU4ES1K5KLNiz';
  var address = 'NAMEuWT2icj3ef8HWJwetZyZbXaZUJ5hFT';
  var nmcNet;

  describe('setup', function(){

    it('should overload bitcore on require', function(){
      expect(bitcore.Opcode.OP_NAME_NEW).to.not.exist();
      bitcoreNamecoin = require('../');
      expect(bitcore.Opcode.OP_NAME_NEW).to.exist();
    });

    it('should have setup namecoin network', function(){
      nmcNet = new Networks.get('namecoin');
      expect( nmcNet).to.exist();
      expect( nmcNet.pubkeyhash).to.equal(0x34);
      expect( nmcNet.privatekey).to.equal(0xB4);
      expect( nmcNet.scripthash).to.equal(13);
    });

    it('should have setup namecoin constants', function(){
      expect( Opcode.OP_NAME_NEW).to.equal(81);
      expect( Opcode.OP_NAME_FIRSTUPDATE).to.equal(82);
      expect( Opcode.OP_NAME_UPDATE).to.equal(83);
    });
  });

  describe('private key handling', function(){
    it('should be able to generate a nmc address from a WIF', function(){
      var privKey = new PrivateKey(wif, nmcNet);
      expect(privKey).to.exist();
      var addressFromWIF = privKey.toAddress().toString();
      expect(addressFromWIF).to.equal(address);
    });
  });

  describe('namecoin scripts', function(){
    // before(function(){
    // });

    it('should be able to parse normal p2pk transactions', function(){
      var p2pkscript = new Script.buildPublicKeyHashOut(address).toString();
      var s = new Script.fromString( p2pkscript);
      expect(s).to.exist();
      expect(s.toString()).to.equal(p2pkscript);
    });

    it('should be able to parse name new ASM scripts', function(){
      var nameNewScript = '1 1baa8c92fae059f5bcd69566c6c25771fa392133 ' +
        'OP_2DROP OP_DUP OP_HASH160 422040870cb08ff6afe48220042bf0b370' +
        '274f75 OP_EQUALVERIFY OP_CHECKSIG';
      var s = Script.fromString( nameNewScript);
      expect(s).to.exist();
    });

    it('should be able to parse name_firstupdate ASM scripts', function(){
      var nameFirstUpdateScript = '2 642f72616964 467e5b41d4bcb8c100 7b2' +
        '26970223a223231322e3233322e35312e3936222c22656d61696c223a226e61' +
        '6d65636f696e406d61696c2e636f6d222c226d6170223a7b22223a223231322' +
        'e3233322e35312e3936222c22777777223a223231322e3233322e35312e3936' +
        '227d7d OP_2DROP OP_2DROP OP_DUP OP_HASH160 bc75e0ff697fa018ab75' +
        'ab93ddaa6b8cbe3d8277 OP_EQUALVERIFY OP_CHECKSIG';
      var s = Script.fromString( nameFirstUpdateScript);
      expect(s).to.exist();
    });

    if('should be able to parse name_update ASM scripts', function(){
      var nameUpdateScript = '3 642f72616964 7b226970223a223231322e32333' +
        '22e35312e3936222c226d6170223a7b222a223a223231322e3233322e35312e' +
        '3936227d2c22656d61696c223a226e616d65636f696e406d61696c2e636f6d2' +
        '27d OP_2DROP OP_DROP OP_DUP OP_HASH160 7d1547a461df0e192b1ee884' +
        'ae510f0a0bf685d3 OP_EQUALVERIFY OP_CHECKSIG';
      var s = bitcore.Script.fromString( nameUpdateScript);
      expect(s).to.exist();
    });
  });

  describe('raw name scripts', function(){

    /**
     * Test raw format
     */
    var testScripts = [{
      type: 'name_new',
      name: 'test',
      value: '62e99f4a5b9fb17f7a36e2bfd4e0f7e7ff2b68fa',
      address: 'MzBrnKStnHJDc8dViFbEP5JcTWW6oG4Fdk',
      string: '1 62e99f4a5b9fb17f7a36e2bfd4e0f7e7ff2b68fa OP_2DROP OP_DUP OP_HASH160 279ecb39bda7cfa2bb9ec8a4a307c5032ba73cf1 OP_EQUALVERIFY OP_CHECKSIG',
      raw: new Buffer('511462e99f4a5b9fb17f7a36e2bfd4e0f7e7ff2b68fa6d76a914279ecb39bda7cfa2bb9ec8a4a307c5032ba73cf188ac', 'hex')
    },{
      type: 'name_new',
      nameOp: {
        hash: '743bbbb462a2c48a2ef9983c13e6ad220c71a9b2',
        rand: '6c205903a0395be97194832eb670a1ae98d805be'
      },
      string: 'OP_NAME_NEW 743bbbb462a2c48a2ef9983c13e6ad220c71a9b2 OP_2DROP OP_DUP OP_HASH160 79d0e23967803a443a85533f261c6547d10b87d7 OP_EQUALVERIFY OP_CHECKSIG',
      raw: new Buffer('5114743bbbb462a2c48a2ef9983c13e6ad220c71a9b26d76a91479d0e23967803a443a85533f261c6547d10b87d788ac', 'hex')
    },{
      type: 'name_firstupdate',
      name: 'd/vshell',
      value: 'BM-2cUyJNtk9etvKrh8EpYs2BMh4bxxjPsa5K',
      address: 'N7q6TLDsC7bjhkZUQSGJ9sXPTUHA1XXiEs',
      string: '2 642f767368656c6c 47deef329a770b51 424d2d326355794a4e746b396574764b7268384570597332424d68346278786a507361354b OP_2DROP OP_2DROP OP_DUP OP_HASH160 7b727a6ffa179a35fc30721c19cf3fb169b7df8b OP_EQUALVERIFY OP_CHECKSIG',
      raw: new Buffer('5208642f767368656c6c0847deef329a770b5125424d2d326355794a4e746b396574764b7268384570597332424d68346278786a507361354b6d6d76a9147b727a6ffa179a35fc30721c19cf3fb169b7df8b88ac', 'hex')
    },{
      type: 'name_update',
      name: 'test',
      value: 'BM-5oDW5JuVckVnSDSdcMxySi5cNTadThf',
      address: 'N4FvXJswiKnwCD5PhqFbjanVH3ZSfy8rbC',
      string: '3 74657374 424d2d356f4457354a7556636b566e53445364634d7879536935634e546164546866 OP_2DROP OP_DROP OP_DUP OP_HASH160 544415765c022729a8ac7bf904b836bcc7a5a026 OP_EQUALVERIFY OP_CHECKSIG',
      raw: new Buffer('53047465737422424d2d356f4457354a7556636b566e53445364634d7879536935634e5461645468666d7576a914544415765c022729a8ac7bf904b836bcc7a5a02688ac', 'hex')
    },{
      // Long value
      type: 'name_firstupdate',
      name: 'LLLL',
      value: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      string : 'OP_NAME_FIRSTUPDATE 30303030303030303030 ece23059be5f0c41cbac5a10d04c10a685e4935d 30303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030 OP_2DROP OP_2DROP OP_DUP OP_HASH160 79e37b64460bc8935f26b067b10a98fb34cd3eea OP_EQUALVERIFY OP_CHECKSIG',
      raw : new Buffer('520a3030303030303030303014ece23059be5f0c41cbac5a10d04c10a685e4935d4d9001303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030306d6d76a91479e37b64460bc8935f26b067b10a98fb34cd3eea88ac', 'hex'),
    },{
      // long name
      // NOTE: In namecore, short (<5) chr names get encoded as some type of a
      // number in ASM. This is a bug of some kind, so we shouldn't code around that
      // as it may get fixed as some point.
      type: 'name_firstupdate',
      name: '0000',
      value: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      string: 'OP_NAME_FIRSTUPDATE 3030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030 229b995a76a5efa7e4d01766ba8e1fc960ab14e7 30303030 OP_2DROP OP_2DROP OP_DUP OP_HASH160 2ad843fc5cb10ffb09fd593fe2d9089f5cb5fbf5 OP_EQUALVERIFY OP_CHECKSIG',
      raw: new Buffer('524cc8303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303014229b995a76a5efa7e4d01766ba8e1fc960ab14e704303030306d6d76a9142ad843fc5cb10ffb09fd593fe2d9089f5cb5fbf588ac', 'hex'),
    }];

    var checkScriptStringConversion = function( script) {
      // ASM -> bitcore Script object -> buffer should equal original buffer
      var scriptStr = new Script.fromString( script.string);
      var converted = bufferTools.bufferToHex(scriptStr.toBuffer());
      var original = bufferTools.bufferToHex(script.raw);
      var match = (converted === original);
      return match;
    };

    var checkScriptBufferConversion = function( script) {
      // HEX -> bitcore Script object -> buffer should equal original buffer
      var scriptBuf = new Script.fromBuffer( script.raw);
      var converted = bufferTools.bufferToHex(scriptBuf.toBuffer());
      var original = bufferTools.bufferToHex(script.raw);
      var match = (converted === original);
      return match;
    };

    it('should be able to parse name new from string', function(){
      var match1 = checkScriptStringConversion( testScripts[0]);
      var match2 = checkScriptStringConversion( testScripts[1]);
      expect(match1).to.be.true;
      expect(match2).to.be.true;
    });

    it('should be able to parse name new from hex', function(){
      var match1 = checkScriptBufferConversion( testScripts[0]);
      var match2 = checkScriptBufferConversion( testScripts[1]);
      expect(match1).to.be.true;
      expect(match2).to.be.true;
    });

    it('should be able to parse name first update from string', function(){
      var match = checkScriptStringConversion( testScripts[2]);
      expect(match).to.be.true;
    });

    it('should be able to parse name first update from hex', function(){
      var match = checkScriptBufferConversion( testScripts[2]);
      expect(match).to.be.true;
    });

    it('should be able to parse name update from string', function(){
      var match = checkScriptStringConversion( testScripts[3]);
      expect(match).to.be.true;
    });

    it('should be able to parse name_firstupdate with long value from string', function(){
      var match = checkScriptStringConversion( testScripts[4]);
      expect(match).to.be.true;
    });

    it('should be able to parse name_firstupdate with long value from buffer', function(){
      var match = checkScriptBufferConversion( testScripts[4]);
      expect(match).to.be.true;
    });

    it('should be able to parse firstupdate w/ long name from string', function(){
      var match = checkScriptStringConversion( testScripts[5]);
      expect(match).to.be.true;
    });

    it('should be able to parse firstupdate w/ long name from buffer', function(){
      var match = checkScriptBufferConversion( testScripts[5]);
      expect(match).to.be.true;
    });

  });
});
