'use strict';

var Buffer = require('buffer').Buffer;
var ethutil = require('ethereumjs-util');
var TX = require('ethereumjs-tx');
var Promise = require('bluebird');
var BigNumber = require('bignumber.js');

module.exports = function (self) {
  return {
    latestTime: function latestTime() {
      return self.web3.eth.getBlock('latest').timestamp;
    },

    increaseTime: function increaseTime(duration) {
      var id = Date.now();

      return new Promise(function (resolve, reject) {
        self.web3.currentProvider.sendAsync({
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [duration],
          id: id
        }, function (e1) {
          if (e1) return reject(e1);

          self.web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id + 1
          }, function (e2, res) {
            return e2 ? reject(e2) : resolve(res);
          });
        });
      });
    },

    increaseTimeTo: function increaseTimeTo(target) {
      var now = this.latestTime();
      if (target < now) throw Error('Cannot increase current time(' + now + ') to a moment in the past(' + target + ')');
      var diff = target - now;
      return this.increaseTime(diff);
    },

    assertThrowsAsync: async function assertThrowsAsync(fn, regExp) {
      var f = function f() {};
      try {
        await fn();
      } catch (e) {
        f = function f() {
          throw e;
        };
      } finally {
        assert.throws(f, regExp);
      }
    },

    duration: {
      seconds: function seconds(val) {
        return val;
      },
      minutes: function minutes(val) {
        return val * this.seconds(60);
      },
      hours: function hours(val) {
        return val * this.minutes(60);
      },
      days: function days(val) {
        return val * this.hours(24);
      },
      weeks: function weeks(val) {
        return val * this.days(7);
      },
      years: function years(val) {
        return val * this.days(365);
      }
    },

    deployContract: async function deployContract(bytes, signer) {
      var gas = await self.web3.eth.getGasPrice();

      // TODO: get use public key of private key to generate account
      var nonce = await self.web3.eth.getTransactionCount(signer);

      var rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(4612388),
        data: bytes,
        from: signer
      };

      var tx = new TX(rawTx, 3);
      tx.sign(this.hexToBuffer(self.privateKey));
      var serialized = tx.serialize();

      var txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));
      //let txHash = '0xff0b70a7210b8c70a3d0dc9eb33144d308cce763fdcc10d4f836022f20e03d22'
      await this.waitForConfirm(txHash);
      var receipt = await self.web3.eth.getTransactionReceipt(txHash.transactionHash);
      var contract_address = receipt.contractAddress;

      return contract_address;
      //return '0x213c5c4a205fa2ca5833befd0fa34b2f5cb64c8f'
    },

    // TODO: combine open and join agreement function to executeAgreement.
    // this will just require swaping the method sig
    executeOpenAgreement: async function executeOpenAgreement(contractABI, address, state, extension, sig, balA, signer) {

      // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
      var c = new self.web3.eth.Contract(contractABI, address);
      var r = sig[0];
      var s = sig[1];
      var v = sig[2];
      var callData = c.methods.openAgreement(state, extension, v, r, s).encodeABI();

      var gas = await self.web3.eth.getGasPrice();
      //gas+=2000000000

      // TODO: get use public key of private key to generate account
      var nonce = await self.web3.eth.getTransactionCount(signer);

      var rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(250000),
        to: address,
        value: await self.web3.utils.toHex(balA),
        data: callData,
        from: signer
      };

      var tx = new TX(rawTx, 3);
      tx.sign(this.hexToBuffer(self.privateKey));
      var serialized = tx.serialize();

      var txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));
      //let txHash = '0xff0b70a7210b8c70a3d0dc9eb33144d308cce763fdcc10d4f836022f20e03d22'
      await this.waitForConfirm(txHash);
      return txHash;
    },

    executeJoinAgreement: async function executeJoinAgreement(contractABI, address, state, extension, sig, balB, signer) {
      // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
      var c = new self.web3.eth.Contract(contractABI, address);
      var r = sig[0];
      var s = sig[1];
      var v = sig[2];
      var callData = c.methods.joinAgreement(state, extension, v, r, s).encodeABI();

      var gas = await self.web3.eth.getGasPrice();

      var nonce = await self.web3.eth.getTransactionCount(signer);

      //gas+=2000000000

      var rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(250000),
        to: address,
        value: await self.web3.utils.toHex(balB),
        data: callData,
        from: signer
      };

      var tx = new TX(rawTx, 3);
      tx.sign(this.hexToBuffer(self.privateKey));
      var serialized = tx.serialize();

      var txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));
      //let txHash = '0x8d470165aa3cee1f5d6e927b90d20a59a14318964fa67846a230535443b83f07'
      await this.waitForConfirm(txHash);
      return txHash;
    },

    executeCloseAgreement: async function executeCloseAgreement(contractABI, address, state, sigs, signer) {
      // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
      var c = new self.web3.eth.Contract(contractABI, address);

      var r = sigs[0][0];
      var s = sigs[0][1];
      var v = sigs[0][2];
      var r2 = sigs[1][0];
      var s2 = sigs[1][1];
      var v2 = sigs[1][2];

      var sigV = [];
      var sigR = [];
      var sigS = [];

      sigV.push(v);
      sigV.push(v2);
      sigR.push(r);
      sigR.push(r2);
      sigS.push(s);
      sigS.push(s2);

      var callData = c.methods.closeAgreement(state, sigV, sigR, sigS).encodeABI();

      var gas = await self.web3.eth.getGasPrice();

      var nonce = await self.web3.eth.getTransactionCount(signer);

      //gas+=2000000000

      var rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(250000),
        to: address,
        data: callData,
        from: signer
      };

      var tx = new TX(rawTx, 3);
      tx.sign(this.hexToBuffer(self.privateKey));
      var serialized = tx.serialize();

      var txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));
      //let txHash = '0x8d470165aa3cee1f5d6e927b90d20a59a14318964fa67846a230535443b83f07'
      await this.waitForConfirm(txHash);
      return txHash;
    },

    executeDeployCTF: async function executeDeployCTF(contractABI, // registry abi
    address, // registry address
    state, sigs, signer, metaCTF) {
      var c = new self.web3.eth.Contract(contractABI, address);

      var r = sigs[0][0];
      var s = sigs[0][1];
      var v = sigs[0][2];
      var r2 = sigs[1][0];
      var s2 = sigs[1][1];
      var v2 = sigs[1][2];

      var sigV = [];
      var sigR = [];
      var sigS = [];

      sigV.push(v);
      sigV.push(v2);
      sigR.push(r);
      sigR.push(r2);
      sigS.push(s);
      sigS.push(s2);

      var callData = c.methods.deployCTF(state, sigV, sigR, sigS).encodeABI();

      var gas = await self.web3.eth.getGasPrice();

      var nonce = await self.web3.eth.getTransactionCount(signer);

      //gas+=2000000000

      var rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(6500000),
        to: address,
        data: callData,
        from: signer
      };

      var tx = new TX(rawTx, 3);
      tx.sign(this.hexToBuffer(self.privateKey));
      var serialized = tx.serialize();

      var txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));
      await this.waitForConfirm(txHash);
      var metaDeployed = await c.methods.resolveAddress(metaCTF).call();
      //let metaDeployed = '0x69d374647049341aa74f2216434fe2d0715546b4'
      console.log(metaDeployed);
      return metaDeployed;
    },

    executeSettleChannel: async function executeSettleChannel(contractABI, // metachan abi
    address, // metachan address
    chanState, agreeState, sigs, signer, channels) {
      var c = new self.web3.eth.Contract(contractABI, address);

      var elems = [];
      for (var i = 0; i < channels.length; i++) {
        elems.push(this.hexToBuffer(channels[i]));
      }

      var merkle = new self.merkleTree(elems);

      // put root hash in agreement state
      var channelRoot = this.bufferToHex(merkle.getRoot());
      var chanStateHash = self.web3.utils.sha3(chanState, { encoding: 'hex' });
      var proof = merkle.proof(this.hexToBuffer(chanStateHash));

      if (proof.length === 0) {
        proof = [channelRoot];
      }
      proof = this.serializeState(proof);

      console.log(proof);

      var r = sigs[0][0];
      var s = sigs[0][1];
      var v = sigs[0][2];
      var r2 = sigs[1][0];
      var s2 = sigs[1][1];
      var v2 = sigs[1][2];

      var sigV = [];
      var sigR = [];
      var sigS = [];

      sigV.push(v);
      sigV.push(v2);
      sigR.push(r);
      sigR.push(r2);
      sigS.push(s);
      sigS.push(s2);

      var callData = c.methods.startSettleStateSubchannel(proof, agreeState, chanState, sigV, sigR, sigS).encodeABI();

      var gas = await self.web3.eth.getGasPrice();
      // avoid out of gas error
      // running into issues here -Lex
      //gas = BigNumber('20000000000')

      var nonce = await self.web3.eth.getTransactionCount(signer);

      var rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(2000000),
        to: address,
        data: callData,
        from: signer
      };

      var tx = new TX(rawTx, 3);
      tx.sign(this.hexToBuffer(self.privateKey));
      var serialized = tx.serialize();

      var txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));
      //let txHash = '0x34c11641854beb1c01af69aeaf1057ee3e275ead8057eda8a7d5d3260850d24e'
      await this.waitForConfirm(txHash);
      // TODO remove hardcoded ID :(
      var subchannel = await c.methdos.getSubChannel(this.serializeState(['channelId'])).call();
      console.log(subchannel);
      return txHash;
    },

    executeCloseChannel: async function executeCloseChannel(contractABI, address, chanID, signer) {
      var c = new self.web3.eth.Contract(contractABI, address);

      var callData = c.methods.closeSubchannel(this.serializeState([chanID])).encodeABI();

      var gas = await self.web3.eth.getGasPrice();

      var nonce = await self.web3.eth.getTransactionCount(signer);

      var rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(2000000),
        to: address,
        data: callData,
        from: signer
      };

      var tx = new TX(rawTx, 3);
      tx.sign(this.hexToBuffer(self.privateKey));
      var serialized = tx.serialize();

      var txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));
      //let txHash = '0x34c11641854beb1c01af69aeaf1057ee3e275ead8057eda8a7d5d3260850d24e'
      await this.waitForConfirm(txHash);
      return txHash;
    },

    executeFinalizeCloseChannel: async function executeFinalizeCloseChannel(contractABI, address, chanID, signer) {
      var c = new self.web3.eth.Contract(contractABI, address);

      var callData = c.methods.closeWithTimeoutSubchannel(this.serializeState([chanID])).encodeABI();

      var gas = await self.web3.eth.getGasPrice();

      var nonce = await self.web3.eth.getTransactionCount(signer);

      var rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(2000000),
        to: address,
        data: callData,
        from: signer
      };

      var tx = new TX(rawTx, 3);
      tx.sign(this.hexToBuffer(self.privateKey));
      var serialized = tx.serialize();

      var txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));
      //let txHash = '0x34c11641854beb1c01af69aeaf1057ee3e275ead8057eda8a7d5d3260850d24e'
      await this.waitForConfirm(txHash);
      return txHash;
    },

    waitForConfirm: async function waitForConfirm(txHash) {
      //console.log('waiting for '+txHash+' to be confirmed...')
      var receipt = await self.web3.eth.getTransactionReceipt(txHash.transactionHash);

      if (receipt == null) {
        await this.timeout(1000);
        await this.waitForConfirm(txHash);
      } else {
        //console.log('Contract Address: '+ receipt.contractAddress)
        return;
      }
    },

    timeout: function timeout(ms) {
      return new Promise(function (resolve) {
        return setTimeout(resolve, ms);
      });
    },

    getBytes: function getBytes(input) {
      if (Buffer.isBuffer(input)) input = '0x' + input.toString('hex');
      if (66 - input.length <= 0) return self.web3.utils.toHex(input);
      return this.padBytes32(self.web3.utils.toHex(input));
    },

    sha3: function sha3(input) {
      return self.web3.utils.sha3(input, { encoding: 'hex' });
    },

    sign: function sign(message, key) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      var msg = this.hexToBuffer(message);
      var msgHash = ethutil.hashPersonalMessage(msg);
      return ethutil.ecsign(msgHash, this.hexToBuffer(key));
    },

    importPublic: function importPublic(key) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      return ethutil.importPublic(this.hexToBuffer(key));
    },

    ecrecover: function ecrecover(message, v, r, s) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      return ethutil.ecrecover(this.hexToBuffer(message), v, r, s);
    },

    privateToPublic: function privateToPublic(key) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      return ethutil.privateToPublic(this.hexToBuffer(key));
    },

    pubToAddress: function pubToAddress(key) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      return ethutil.pubToAddress(this.hexToBuffer(key));
    },

    serializeState: function serializeState(inputs) {
      var m = this.getBytes(inputs[0]);

      for (var i = 1; i < inputs.length; i++) {
        var x = this.getBytes(inputs[i]);
        m += x.substr(2, x.length);
      }
      return m;
    },

    getCTFaddress: function getCTFaddress(_r) {
      return self.web3.utils.sha3(_r, { encoding: 'hex' });
    },

    getCTFstate: function getCTFstate(_contract, _signers, _args) {
      _args.unshift(_contract);
      var _m = this.serializeState(_args);
      _signers.push(_contract.length);
      _signers.push(_m);
      var _r = this.serializeState(_signers);
      return _r;
    },

    padBytes32: function padBytes32(data) {
      // TODO: check input is hex / move to TS
      var l = 66 - data.length;

      var x = data.substr(2, data.length);

      for (var i = 0; i < l; i++) {
        x = 0 + x;
      }
      return '0x' + x;
    },

    rightPadBytes32: function rightPadBytes32(data) {
      var l = 66 - data.length;

      for (var i = 0; i < l; i++) {
        data += 0;
      }
      return data;
    },

    hexToBuffer: function hexToBuffer(hexString) {
      return new Buffer(hexString.substr(2, hexString.length), 'hex');
    },

    bufferToHex: function bufferToHex(buffer) {
      return '0x' + buffer.toString('hex');
    }
  };
};