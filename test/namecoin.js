'use strict';
var _ = require('lodash');
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
var constants = require('../lib/constants');
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
      expect(Opcode.OP_NAME_NEW).to.not.exist();
      // it just returns bitcore
      bitcoreNamecoin = require('../index');
      expect(Opcode.OP_NAME_NEW).to.exist();
    });

    it('should return instantiated bitcore instance', function(){
      var bitcore2 = require('../index');
      expect(bitcore2.Opcode).to.exist();
      expect(bitcore2.Opcode.OP_NAME_FIRSTUPDATE).to.exist();
      expect(bitcore2.Transaction).to.exist();
      expect(new bitcore2.Transaction().nameNew).to.exist();
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

  describe('namecoin core scripts compliance', function(){
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
      var s = new Script.fromString( nameNewScript);
      expect(s).to.exist();
    });

    it('should be able to parse name_firstupdate ASM scripts', function(){
      var nameFirstUpdateScript = '2 642f72616964 467e5b41d4bcb8c100 7b2' +
        '26970223a223231322e3233322e35312e3936222c22656d61696c223a226e61' +
        '6d65636f696e406d61696c2e636f6d222c226d6170223a7b22223a223231322' +
        'e3233322e35312e3936222c22777777223a223231322e3233322e35312e3936' +
        '227d7d OP_2DROP OP_2DROP OP_DUP OP_HASH160 bc75e0ff697fa018ab75' +
        'ab93ddaa6b8cbe3d8277 OP_EQUALVERIFY OP_CHECKSIG';
      var s = new Script.fromString( nameFirstUpdateScript);
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
      value: '00000000000000000000000000000000000000000000000000000000000000' +
        '0000000000000000000000000000000000000000000000000000000000000000000' +
        '0000000000000000000000000000000000000000000000000000000000000000000' +
        '0000000000000000000000000000000000000000000000000000000000000000000' +
        '0000000000000000000000000000000000000000000000000000000000000000000' +
        '0000000000000000000000000000000000000000000000000000000000000000000' +
        '000',
      string : 'OP_NAME_FIRSTUPDATE 30303030303030303030 ece23059be5f0c41cba' +
        'c5a10d04c10a685e4935d 303030303030303030303030303030303030303030303' +
        '0303030303030303030303030303030303030303030303030303030303030303030' +
        '3030303030303030303030303030303030303030303030303030303030303030303' +
        '0303030303030303030303030303030303030303030303030303030303030303030' +
        '3030303030303030303030303030303030303030303030303030303030303030303' +
        '0303030303030303030303030303030303030303030303030303030303030303030' +
        '3030303030303030303030303030303030303030303030303030303030303030303' +
        '0303030303030303030303030303030303030303030303030303030303030303030' +
        '3030303030303030303030303030303030303030303030303030303030303030303' +
        '0303030303030303030303030303030303030303030303030303030303030303030' +
        '3030303030303030303030303030303030303030303030303030303030303030303' +
        '0303030303030303030303030303030303030303030303030303030303030303030' +
        '303030303030303030 OP_2DROP OP_2DROP OP_DUP OP_HASH160 79e37b64460b' +
        'c8935f26b067b10a98fb34cd3eea OP_EQUALVERIFY OP_CHECKSIG',
      raw : new Buffer(
        '520a3030303030303030303014ece23059be5f0c41cbac5a10d04c10a685e4935d4' +
          'd9001303030303030303030303030303030303030303030303030303030303030' +
          '30303030303030303030303030303030303030303030303030303030303030303' +
          '03030303030303030303030303030303030303030303030303030303030303030' +
          '30303030303030303030303030303030303030303030303030303030303030303' +
          '03030303030303030303030303030303030303030303030303030303030303030' +
          '30303030303030303030303030303030303030303030303030303030303030303' +
          '03030303030303030303030303030303030303030303030303030303030303030' +
          '30303030303030303030303030303030303030303030303030303030303030303' +
          '03030303030303030303030303030303030303030303030303030303030303030' +
          '30303030303030303030303030303030303030303030303030303030303030303' +
          '03030303030303030303030303030303030303030303030303030303030303030' +
          '30303030303030303030303030303030303030303030303030303030303030303' +
          '03030303030303030303030306d6d76a91479e37b64460bc8935f26b067b10a98' +
          'fb34cd3eea88ac', 'hex'),
    },{
      // long name
      // NOTE: In namecore, short (<5) chr names get encoded as some type of a
      // number in ASM. This is a bug of some kind, so we shouldn't code around that
      // as it may get fixed as some point.
      type: 'name_firstupdate',
      name: '0000',
      value: '00000000000000000000000000000000000000000000000000000000000000' +
        '0000000000000000000000000000000000000000000000000000000000000000000' +
        '0000000000000000000000000000000000000000000000000000000000000000000' +
        '0000',
      string: 'OP_NAME_FIRSTUPDATE 30303030303030303030303030303030303030303' +
        '0303030303030303030303030303030303030303030303030303030303030303030' +
        '3030303030303030303030303030303030303030303030303030303030303030303' +
        '0303030303030303030303030303030303030303030303030303030303030303030' +
        '3030303030303030303030303030303030303030303030303030303030303030303' +
        '0303030303030303030303030303030303030303030303030303030303030303030' +
        '303030303030303030303030 229b995a76a5efa7e4d01766ba8e1fc960ab14e7 3' +
        '0303030 OP_2DROP OP_2DROP OP_DUP OP_HASH160 2ad843fc5cb10ffb09fd593' +
        'fe2d9089f5cb5fbf5 OP_EQUALVERIFY OP_CHECKSIG',
      raw: new Buffer(
        '524cc83030303030303030303030303030303030303030303030303030303030303' +
          '03030303030303030303030303030303030303030303030303030303030303030' +
          '30303030303030303030303030303030303030303030303030303030303030303' +
          '03030303030303030303030303030303030303030303030303030303030303030' +
          '30303030303030303030303030303030303030303030303030303030303030303' +
          '03030303030303030303030303030303030303030303030303030303030303030' +
          '3030303030303014229b995a76a5efa7e4d01766ba8e1fc960ab14e7043030303' +
          '06d6d76a9142ad843fc5cb10ffb09fd593fe2d9089f5cb5fbf588ac', 'hex'),
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

  describe('transactions', function(){
    describe('name_new namecoin compliance', function(){
      var reference = [{
        txid: '9f73e1dfa3cbae23d008307e42e72beb8c010546ea2a7b9ff32619676a9c64a6',
        hex: '0100000001c28db059cf6371ea20b4a27d6717f8d65687e31488d981' +
          '0e89320ad65c0f6a58000000004847304402200330ce551349975ba7463939cf6' +
          'aad61fc958efbdb8cbd127cfe885736c481b002207584ecb686399aa99d57d3cd' +
          'd30b932a438350f8e3000430cce0d605d031994901feffffff0200349a3b00000' +
          '0001976a914f0ea873eec1bb48698997f6e690bc44d4da51b5a88ac00286bee00' +
          '0000001976a914ef519d95ad3804f303e34c084c6e2cf95d6714fd88ac40000000',
        note: 'coinbase -> address (n3LMZeg6zcRJpe9WTpBSG8YgjzRAhLgfLU). ' +
          'we\'re using this to get a non-coinbase utxo since bitcore ' +
          'doesn\'t support coinbase utxos',
        toAmount: 40,
        toAddress: 'n3LMZeg6zcRJpe9WTpBSG8YgjzRAhLgfLU'
      },{
        txid: '84ff94348c51ad1ae1b967dea18b97df19d5b476b7fe841a1009506f177b9fcf',
        hex: '0071000001a6649c6a671926f39f7b2aea4605018ceb2be7427e3008d023ae' +
          'cba3dfe1739f010000006a47304402201be5c74d880b24a9a322d0b4ebb759559' +
          'ae9784439c5ed5725ecb505c6f87a8902204d2db5af6ad7fef3c5520d4967390c' +
          '022eace3d02fceb546dded2f4c29782b580121035420be18d2bbc623f28bcecbc' +
          'b63d0b2bb43e38301765ee4c12fa9fc723643eafeffffff0240420f0000000000' +
          '3051148e2333d84d8632cc5b52a31dc62a872d242011956d76a914cdb6ac41452' +
          '44c8e8e800be5f15f8d4f1c60649a88ac00245bee000000001976a91464142e44' +
          'b9d4976f58668dfb493275dc50653cdf88ac65000000',
        note: 'name new (mzGfeiJFdQyiuQnhB45aeBYefzHJSsiSfj) and change ' +
          '(mpe83RGRVWibHrdgfmkJwTxgufNs9quaZC), coins from above transaction',
      }];

      var privKeys = {
        'n3LMZeg6zcRJpe9WTpBSG8YgjzRAhLgfLU':
        'cP69o89cc1M25ihJbY1kN5mfvkkFA99sErEbpfyXbktoY75peLPL',
        'mzGfeiJFdQyiuQnhB45aeBYefzHJSsiSfj':
        'cNzvoLYxsKfM8vVdRdaHqSTVBaRZFHn4kpxY6Ws3mFNQZvFEF61s',
        'mpe83RGRVWibHrdgfmkJwTxgufNs9quaZC':
        'cNsgnYSHkfzBofkPY3aKgqQ7njgfDa7ya4A4H3k3qzUV2NGviJvb',
        'NAMEuWT2icj3ef8HWJwetZyZbXaZUJ5hFT':
        '74pxNKNpByQ2kMow4d9kF6Z77BYeKztQNLq3dSyU4ES1K5KLNiz'
      };
      var wifNamecoin = '74pxNKNpByQ2kMow4d9kF6Z77BYeKztQNLq3dSyU4ES1K5KLNiz';
      var privKeySet = _.map(privKeys, function(k,v){ return v; });

      var referenceFee = 0049600;
      var value = new bitcore.Unit.fromBTC(40).satoshis;
      var referenceTx = new bitcore.Transaction( reference[1].hex);

      // this is the utxo from tx 9f73e1dfa3cbae23d008307e42e72beb8c010546ea2a7b9ff32619676a9c64a6c
      // in our reference transactions, we spent this output in our name_new tx
      var utxo = new bitcore.Transaction.UnspentOutput({
        txId: '9f73e1dfa3cbae23d008307e42e72beb8c010546ea2a7b9ff32619676a9c64a6',
        outputIndex: 1,
        address: 'n3LMZeg6zcRJpe9WTpBSG8YgjzRAhLgfLU',
        script: '76a914ef519d95ad3804f303e34c084c6e2cf95d6714fd88ac',
        amount: 40.00000000
      });

      var nmcAddress = 'mzGfeiJFdQyiuQnhB45aeBYefzHJSsiSfj';
      var referenceRand = 'ed9bdb284922968e40a7177605203132f42b7e30';

      function nameNewTransaction() {
        return new bitcore.Transaction()
          .from(utxo)
          .nameNew('AAA', referenceRand, nmcAddress)
          .change('mpe83RGRVWibHrdgfmkJwTxgufNs9quaZC')
          .fee(referenceFee)
          .sign([privKeys[nmcAddress], privKeys['n3LMZeg6zcRJpe9WTpBSG8YgjzRAhLgfLU']]);
      }

      it('should set the correct version type on name output', function(){
        var txNameNew = nameNewTransaction();
        expect(txNameNew.version).to.equal(constants.NAMECOIN_TX_VERSION);
      });

      it('should serialize correctly', function(){
        var txNameNew = nameNewTransaction();
        expect(txNameNew.serialize()).to.be.a.string;
      });

      it('should be able to load reference raw transaction', function(){
        var refTx = new bitcore.Transaction(reference[1].hex);
        expect(refTx).to.exist();
      });

      it('should be able to generate matching name_new output', function(){
        var refTx = new bitcore.Transaction(reference[1].hex);
        var txNameNew = nameNewTransaction();
        expect(refTx.outputs[0].script.toHex())
          .to
          .equal(txNameNew.outputs[0].script.toHex());
      });

      it('should have the same number of outputs as reference', function(){
        var tx = nameNewTransaction();
        expect(referenceTx.outputs.length).to.equal(tx.outputs.length);
      });

      it('should have the same number of inputs as reference', function(){
        var tx = nameNewTransaction();
        expect(referenceTx.inputs.length).to.equal(tx.inputs.length);
      });
    });

    describe('name_firstupdate namecoin core compliance', function(){
      var referenceTx = new bitcore.Transaction(
        '0071000002f1caaa25640f991549468dfe96aec35891754ab7720ae13c9ac0facfe' +
        'd032c44000000006b483045022100d0e93550840ec52dbf3023cc06f689a304d8df' +
        'dfdb9ccdd6f00b542b5d428a44022066a93d56cb33280ab734e74c8881b0e36f668' +
        '7cd21815d7c82f1bd4619578f16012102d0ca223f7c6962edb3751ef56130953c81' +
        'cf739088e747604c9653acbe637645fefffffff1caaa25640f991549468dfe96aec' +
        '35891754ab7720ae13c9ac0facfed032c44010000006a473044022015a28fb7d80a' +
        '00eaa92deb32c8292ebd7697d4281c58d00750c9dbfb942bde2a02201942aac73fe' +
        '019c5b7283a7d79c1509965eaf1e36e9b47072d4416d5ab6662a7012103e3f9de95' +
        '85e2b4d9ef15239f837b5e0157ba366a052229d3e9cbe7328d1256fffeffffff024' +
        '0420f0000000000425205303030303014856f8936cc13dfe42434b9979eaf8908b5' +
        '7467660a414141414141414141416d6d76a914654839268ad8bf9102436b2dd9560' +
        '72a71ba282388acc8db49ee000000001976a914fe82cf1764ae4d1a30efdbfae2f6' +
        '783142ca6c4488ac66000000');

      var updateAddr = 'mpkV4b3uEH71eFDnij5rGa68xUPad2huU5';
      var changeAddr = 'n5igdYWsZNYczkAnJTgdgwcQ9SGn4XSduC';
      var inputAddr  = 'mim8sVq4M52orE7SHFQZziRf9a8Mh5dESr';
      var nameNewAddr = 'mw7rv9bJ7yQaykWbuCnh5bDRLeFkAVzjF5'
      var ref = {
        value: 'AAAAAAAAAA',
        name: '00000',
        rand: '856f8936cc13dfe42434b9979eaf8908b5746766'
      };
      var utxo = new bitcore.Transaction.UnspentOutput({
        txId: '442c03edcffac09a3ce10a72b74a759158c3ae96fe8d464915990f6425aacaf1',
        outputIndex: 1,
        address: inputAddr,
        script: '76a9142397079c8b1a1d2c71d8da4505cba3b575c6700b88ac',
        amount: 39.97900600
      });
      var nameNewUtxo = new bitcore.Transaction.UnspentOutput({
        txId: '442c03edcffac09a3ce10a72b74a759158c3ae96fe8d464915990f6425aacaf1',
        outputIndex: 0,
        address: nameNewAddr,
        script: new Buffer('511414672014d25a6e99e54ef38d35594beb101c184f6d76a914ab23f4d4398efcddf01a31bbc1306bb96caf22b488ac','hex'),
        amount: 0.01000000
      });

      var privKeys = {
        'mim8sVq4M52orE7SHFQZziRf9a8Mh5dESr':
        'cSxKrEowtiSSyM6oGa8EJWJrEeRC5wZ9Z8npE9BUfvSxLEirpFL9',
        'mw7rv9bJ7yQaykWbuCnh5bDRLeFkAVzjF5':
        'cQjJfmREwK9VfQj6DF6vkcMW5jeo8Mh88B8sgXQgKbw6dLUDcj6i'
      };
      var privKeySet = _.map(privKeys, function(k,v){ return v; });

      function nameFirstUpdateTransaction() {
        return new bitcore.Transaction()
          .from([utxo, nameNewUtxo])
          .nameFirstUpdate(ref.name, ref.rand, ref.value, updateAddr)
          .change('mpe83RGRVWibHrdgfmkJwTxgufNs9quaZC')
          .fee(constants.NETWORK_FEE.satoshis)
          .sign([privKeys[inputAddr], privKeys[nameNewAddr]]);
      }

      var privKey = new bitcore.PrivateKey('cQjJfmREwK9VfQj6DF6vkcMW5jeo8Mh88B8sgXQgKbw6dLUDcj6i');
      var addr = privKey.toAddress(); // mw7rv9bJ7yQaykWbuCnh5bDRLeFkAVzjF5,

      it('should set the correct version type on name output', function(){
        var tx = nameFirstUpdateTransaction();
        expect(tx.version).to.equal(constants.NAMECOIN_TX_VERSION);
      });

      it('should serialize correctly', function(){
        var tx = nameFirstUpdateTransaction();
        expect(tx.serialize()).to.be.a.string;
      });

      it('should have the same number of outputs as reference', function(){
        var tx = nameFirstUpdateTransaction();
        expect(tx.outputs.length).to.equal(2);
      });

      it('should have the same number of inputs as reference', function(){
        // this is the name_new address
        var tx = nameFirstUpdateTransaction();
        expect(tx.inputs.length).to.equal(2);
      });
    });

    describe('name_update namecoin core compliance', function(){
      var utxos = [new bitcore.Transaction.UnspentOutput({
        txId: '4ef6103cebf052cd90f1ed95911616f4eafe1ca20b37fd678b16d35ef6d3c3a6',
        amount: 39.94416000,
        outputIndex: 0,
        script : '76a9144dc9a65e884431457db646b40b0965b2b47abed488ac',
        // cRBzJvXxR7Rv7GYSvueHimHNwzZ84F9dPkwbvsC5YkQqiQmdbAgR
        address:'mncFthoMALxsEVczNpbfcToikRGhewbdsk'
      }), new bitcore.Transaction.UnspentOutput({
        txId: '4ef6103cebf052cd90f1ed95911616f4eafe1ca20b37fd678b16d35ef6d3c3a6',
        amount: 0.01000000,
        outputIndex: 1,
        script: '520a4141414141414141414114931def0cd079febdebda7779ab7c9b4e6' +
          'adddfe00a424242424242424242426d6d76a91434233eeb4966ce27021b274a61' +
          '8239b95bd35fc488ac',
        // cPaKrh32pk3eWSAhj7nLePZt9NSrfME7Xia1Ne6doSgYxWhxP9cb
        address:'mkGdewyuvU13uHzpMUZe2t8ii4LKgKC8mE'
      })];

      function nameUpdateTransaction() {
        var tx =  new bitcore.Transaction()
          .from(utxos)
          .nameUpdate('AAAAAAAAAA', 'CCCCCCCCCC', 'mkGdewyuvU13uHzpMUZe2t8ii4LKgKC8mE')
          .change('mkVNqbVqcYxi3zB2fRfiRQonf4JjwdAvnE')
          .fee(constants.NETWORK_FEE.satoshis)
          .sign([
            'cRBzJvXxR7Rv7GYSvueHimHNwzZ84F9dPkwbvsC5YkQqiQmdbAgR',
            'cPaKrh32pk3eWSAhj7nLePZt9NSrfME7Xia1Ne6doSgYxWhxP9cb'
          ]);
        return tx;
      }

      it('should set the correct version type on name output', function(){
        var tx = nameUpdateTransaction();
        expect(tx.version).to.equal(constants.NAMECOIN_TX_VERSION);
      });

      it('should serialize correctly', function(){
        var tx = nameUpdateTransaction();
        expect(tx.serialize()).to.be.a.string;
      });

      it('should have the same number of outputs as reference', function(){
        var tx = nameUpdateTransaction();
        expect(tx.outputs.length).to.equal(2);
      });

      it('should have the same number of inputs as reference', function(){
        var tx = nameUpdateTransaction();
        expect(tx.inputs.length).to.equal(2);
      });
    });

  });
});
