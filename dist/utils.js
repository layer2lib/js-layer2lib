'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

    assertThrowsAsync: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fn, regExp) {
        var f;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                f = function f() {};

                _context.prev = 1;
                _context.next = 4;
                return fn();

              case 4:
                _context.next = 9;
                break;

              case 6:
                _context.prev = 6;
                _context.t0 = _context['catch'](1);

                f = function f() {
                  throw _context.t0;
                };

              case 9:
                _context.prev = 9;

                assert.throws(f, regExp);
                return _context.finish(9);

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 6, 9, 12]]);
      }));

      function assertThrowsAsync(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return assertThrowsAsync;
    }(),

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

    deployContract: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(bytes, signer) {
        var gas, nonce, rawTx, tx, serialized, txHash, receipt, contract_address;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return self.web3.eth.getGasPrice();

              case 2:
                gas = _context2.sent;
                _context2.next = 5;
                return self.web3.eth.getTransactionCount(signer);

              case 5:
                nonce = _context2.sent;
                _context2.next = 8;
                return self.web3.utils.toHex(nonce);

              case 8:
                _context2.t0 = _context2.sent;
                _context2.next = 11;
                return self.web3.utils.toHex(gas);

              case 11:
                _context2.t1 = _context2.sent;
                _context2.next = 14;
                return self.web3.utils.toHex(4612388);

              case 14:
                _context2.t2 = _context2.sent;
                _context2.t3 = bytes;
                _context2.t4 = signer;
                rawTx = {
                  nonce: _context2.t0,
                  gasPrice: _context2.t1,
                  gasLimit: _context2.t2,
                  data: _context2.t3,
                  from: _context2.t4
                };
                tx = new TX(rawTx, 3);

                tx.sign(this.hexToBuffer(self.privateKey));
                serialized = tx.serialize();
                _context2.next = 23;
                return self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));

              case 23:
                txHash = _context2.sent;
                _context2.next = 26;
                return this.waitForConfirm(txHash);

              case 26:
                _context2.next = 28;
                return self.web3.eth.getTransactionReceipt(txHash.transactionHash);

              case 28:
                receipt = _context2.sent;
                contract_address = receipt.contractAddress;
                return _context2.abrupt('return', contract_address);

              case 31:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function deployContract(_x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return deployContract;
    }(),

    // TODO: combine open and join agreement function to executeAgreement.
    // this will just require swaping the method sig
    executeOpenAgreement: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(contractABI, address, state, extension, sig, balA, signer) {
        var c, r, s, v, callData, gas, nonce, rawTx, tx, serialized, txHash;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:

                // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
                c = new self.web3.eth.Contract(contractABI, address);
                r = sig[0];
                s = sig[1];
                v = sig[2];
                callData = c.methods.openAgreement(state, extension, v, r, s).encodeABI();
                _context3.next = 7;
                return self.web3.eth.getGasPrice();

              case 7:
                gas = _context3.sent;
                _context3.next = 10;
                return self.web3.eth.getTransactionCount(signer);

              case 10:
                nonce = _context3.sent;
                _context3.next = 13;
                return self.web3.utils.toHex(nonce);

              case 13:
                _context3.t0 = _context3.sent;
                _context3.next = 16;
                return self.web3.utils.toHex(gas);

              case 16:
                _context3.t1 = _context3.sent;
                _context3.next = 19;
                return self.web3.utils.toHex(250000);

              case 19:
                _context3.t2 = _context3.sent;
                _context3.t3 = address;
                _context3.next = 23;
                return self.web3.utils.toHex(balA);

              case 23:
                _context3.t4 = _context3.sent;
                _context3.t5 = callData;
                _context3.t6 = signer;
                rawTx = {
                  nonce: _context3.t0,
                  gasPrice: _context3.t1,
                  gasLimit: _context3.t2,
                  to: _context3.t3,
                  value: _context3.t4,
                  data: _context3.t5,
                  from: _context3.t6
                };
                tx = new TX(rawTx, 3);

                tx.sign(this.hexToBuffer(self.privateKey));
                serialized = tx.serialize();
                _context3.next = 32;
                return self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));

              case 32:
                txHash = _context3.sent;
                _context3.next = 35;
                return this.waitForConfirm(txHash);

              case 35:
                return _context3.abrupt('return', txHash);

              case 36:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function executeOpenAgreement(_x5, _x6, _x7, _x8, _x9, _x10, _x11) {
        return _ref3.apply(this, arguments);
      }

      return executeOpenAgreement;
    }(),

    executeJoinAgreement: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(contractABI, address, state, extension, sig, balB, signer) {
        var c, r, s, v, callData, gas, nonce, rawTx, tx, serialized, txHash;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
                c = new self.web3.eth.Contract(contractABI, address);
                r = sig[0];
                s = sig[1];
                v = sig[2];
                callData = c.methods.joinAgreement(state, extension, v, r, s).encodeABI();
                _context4.next = 7;
                return self.web3.eth.getGasPrice();

              case 7:
                gas = _context4.sent;
                _context4.next = 10;
                return self.web3.eth.getTransactionCount(signer);

              case 10:
                nonce = _context4.sent;
                _context4.next = 13;
                return self.web3.utils.toHex(nonce);

              case 13:
                _context4.t0 = _context4.sent;
                _context4.next = 16;
                return self.web3.utils.toHex(gas);

              case 16:
                _context4.t1 = _context4.sent;
                _context4.next = 19;
                return self.web3.utils.toHex(250000);

              case 19:
                _context4.t2 = _context4.sent;
                _context4.t3 = address;
                _context4.next = 23;
                return self.web3.utils.toHex(balB);

              case 23:
                _context4.t4 = _context4.sent;
                _context4.t5 = callData;
                _context4.t6 = signer;
                rawTx = {
                  nonce: _context4.t0,
                  gasPrice: _context4.t1,
                  gasLimit: _context4.t2,
                  to: _context4.t3,
                  value: _context4.t4,
                  data: _context4.t5,
                  from: _context4.t6
                };
                tx = new TX(rawTx, 3);

                tx.sign(this.hexToBuffer(self.privateKey));
                serialized = tx.serialize();
                _context4.next = 32;
                return self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));

              case 32:
                txHash = _context4.sent;
                _context4.next = 35;
                return this.waitForConfirm(txHash);

              case 35:
                return _context4.abrupt('return', txHash);

              case 36:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function executeJoinAgreement(_x12, _x13, _x14, _x15, _x16, _x17, _x18) {
        return _ref4.apply(this, arguments);
      }

      return executeJoinAgreement;
    }(),

    executeCloseAgreement: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(contractABI, address, state, sigs, signer) {
        var c, r, s, v, r2, s2, v2, sigV, sigR, sigS, callData, gas, nonce, rawTx, tx, serialized, txHash;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
                c = new self.web3.eth.Contract(contractABI, address);
                r = sigs[0][0];
                s = sigs[0][1];
                v = sigs[0][2];
                r2 = sigs[1][0];
                s2 = sigs[1][1];
                v2 = sigs[1][2];
                sigV = [];
                sigR = [];
                sigS = [];


                sigV.push(v);
                sigV.push(v2);
                sigR.push(r);
                sigR.push(r2);
                sigS.push(s);
                sigS.push(s2);

                callData = c.methods.closeAgreement(state, sigV, sigR, sigS).encodeABI();
                _context5.next = 19;
                return self.web3.eth.getGasPrice();

              case 19:
                gas = _context5.sent;
                _context5.next = 22;
                return self.web3.eth.getTransactionCount(signer);

              case 22:
                nonce = _context5.sent;
                _context5.next = 25;
                return self.web3.utils.toHex(nonce);

              case 25:
                _context5.t0 = _context5.sent;
                _context5.next = 28;
                return self.web3.utils.toHex(gas);

              case 28:
                _context5.t1 = _context5.sent;
                _context5.next = 31;
                return self.web3.utils.toHex(250000);

              case 31:
                _context5.t2 = _context5.sent;
                _context5.t3 = address;
                _context5.t4 = callData;
                _context5.t5 = signer;
                rawTx = {
                  nonce: _context5.t0,
                  gasPrice: _context5.t1,
                  gasLimit: _context5.t2,
                  to: _context5.t3,
                  data: _context5.t4,
                  from: _context5.t5
                };
                tx = new TX(rawTx, 3);

                tx.sign(this.hexToBuffer(self.privateKey));
                serialized = tx.serialize();
                _context5.next = 41;
                return self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));

              case 41:
                txHash = _context5.sent;
                _context5.next = 44;
                return this.waitForConfirm(txHash);

              case 44:
                return _context5.abrupt('return', txHash);

              case 45:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function executeCloseAgreement(_x19, _x20, _x21, _x22, _x23) {
        return _ref5.apply(this, arguments);
      }

      return executeCloseAgreement;
    }(),

    executeDeployCTF: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(contractABI, // registry abi
      address, // registry address
      state, sigs, signer, metaCTF) {
        var c, r, s, v, r2, s2, v2, sigV, sigR, sigS, callData, gas, nonce, rawTx, tx, serialized, txHash, metaDeployed;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                c = new self.web3.eth.Contract(contractABI, address);
                r = sigs[0][0];
                s = sigs[0][1];
                v = sigs[0][2];
                r2 = sigs[1][0];
                s2 = sigs[1][1];
                v2 = sigs[1][2];
                sigV = [];
                sigR = [];
                sigS = [];


                sigV.push(v);
                sigV.push(v2);
                sigR.push(r);
                sigR.push(r2);
                sigS.push(s);
                sigS.push(s2);

                callData = c.methods.deployCTF(state, sigV, sigR, sigS).encodeABI();
                _context6.next = 19;
                return self.web3.eth.getGasPrice();

              case 19:
                gas = _context6.sent;
                _context6.next = 22;
                return self.web3.eth.getTransactionCount(signer);

              case 22:
                nonce = _context6.sent;
                _context6.next = 25;
                return self.web3.utils.toHex(nonce);

              case 25:
                _context6.t0 = _context6.sent;
                _context6.next = 28;
                return self.web3.utils.toHex(gas);

              case 28:
                _context6.t1 = _context6.sent;
                _context6.next = 31;
                return self.web3.utils.toHex(6500000);

              case 31:
                _context6.t2 = _context6.sent;
                _context6.t3 = address;
                _context6.t4 = callData;
                _context6.t5 = signer;
                rawTx = {
                  nonce: _context6.t0,
                  gasPrice: _context6.t1,
                  gasLimit: _context6.t2,
                  to: _context6.t3,
                  data: _context6.t4,
                  from: _context6.t5
                };
                tx = new TX(rawTx, 3);

                tx.sign(this.hexToBuffer(self.privateKey));
                serialized = tx.serialize();
                _context6.next = 41;
                return self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));

              case 41:
                txHash = _context6.sent;
                _context6.next = 44;
                return this.waitForConfirm(txHash);

              case 44:
                _context6.next = 46;
                return c.methods.resolveAddress(metaCTF).call();

              case 46:
                metaDeployed = _context6.sent;

                //let metaDeployed = '0x69d374647049341aa74f2216434fe2d0715546b4'
                console.log(metaDeployed);
                return _context6.abrupt('return', metaDeployed);

              case 49:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function executeDeployCTF(_x24, _x25, _x26, _x27, _x28, _x29) {
        return _ref6.apply(this, arguments);
      }

      return executeDeployCTF;
    }(),

    executeSettleChannel: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(contractABI, // metachan abi
      address, // metachan address
      chanState, agreeState, sigs, signer, channels) {
        var c, elems, i, merkle, channelRoot, chanStateHash, proof, r, s, v, r2, s2, v2, sigV, sigR, sigS, callData, gas, nonce, rawTx, tx, serialized, txHash, subchannel;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                c = new self.web3.eth.Contract(contractABI, address);
                elems = [];

                for (i = 0; i < channels.length; i++) {
                  elems.push(this.hexToBuffer(channels[i]));
                }

                merkle = new self.merkleTree(elems);

                // put root hash in agreement state

                channelRoot = this.bufferToHex(merkle.getRoot());
                chanStateHash = self.web3.utils.sha3(chanState, { encoding: 'hex' });
                proof = merkle.proof(this.hexToBuffer(chanStateHash));


                if (proof.length === 0) {
                  proof = [channelRoot];
                }
                proof = this.serializeState(proof);

                console.log(proof);

                r = sigs[0][0];
                s = sigs[0][1];
                v = sigs[0][2];
                r2 = sigs[1][0];
                s2 = sigs[1][1];
                v2 = sigs[1][2];
                sigV = [];
                sigR = [];
                sigS = [];


                sigV.push(v);
                sigV.push(v2);
                sigR.push(r);
                sigR.push(r2);
                sigS.push(s);
                sigS.push(s2);

                callData = c.methods.startSettleStateSubchannel(proof, agreeState, chanState, sigV, sigR, sigS).encodeABI();
                _context7.next = 28;
                return self.web3.eth.getGasPrice();

              case 28:
                gas = _context7.sent;
                _context7.next = 31;
                return self.web3.eth.getTransactionCount(signer);

              case 31:
                nonce = _context7.sent;
                _context7.next = 34;
                return self.web3.utils.toHex(nonce);

              case 34:
                _context7.t0 = _context7.sent;
                _context7.next = 37;
                return self.web3.utils.toHex(gas);

              case 37:
                _context7.t1 = _context7.sent;
                _context7.next = 40;
                return self.web3.utils.toHex(2000000);

              case 40:
                _context7.t2 = _context7.sent;
                _context7.t3 = address;
                _context7.t4 = callData;
                _context7.t5 = signer;
                rawTx = {
                  nonce: _context7.t0,
                  gasPrice: _context7.t1,
                  gasLimit: _context7.t2,
                  to: _context7.t3,
                  data: _context7.t4,
                  from: _context7.t5
                };
                tx = new TX(rawTx, 3);

                tx.sign(this.hexToBuffer(self.privateKey));
                serialized = tx.serialize();
                _context7.next = 50;
                return self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));

              case 50:
                txHash = _context7.sent;
                _context7.next = 53;
                return this.waitForConfirm(txHash);

              case 53:
                _context7.next = 55;
                return c.methdos.getSubChannel(this.serializeState(['channelId'])).call();

              case 55:
                subchannel = _context7.sent;

                console.log(subchannel);
                return _context7.abrupt('return', txHash);

              case 58:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function executeSettleChannel(_x30, _x31, _x32, _x33, _x34, _x35, _x36) {
        return _ref7.apply(this, arguments);
      }

      return executeSettleChannel;
    }(),

    executeCloseChannel: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(contractABI, address, chanID, signer) {
        var c, callData, gas, nonce, rawTx, tx, serialized, txHash;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                c = new self.web3.eth.Contract(contractABI, address);
                callData = c.methods.closeSubchannel(this.serializeState([chanID])).encodeABI();
                _context8.next = 4;
                return self.web3.eth.getGasPrice();

              case 4:
                gas = _context8.sent;
                _context8.next = 7;
                return self.web3.eth.getTransactionCount(signer);

              case 7:
                nonce = _context8.sent;
                _context8.next = 10;
                return self.web3.utils.toHex(nonce);

              case 10:
                _context8.t0 = _context8.sent;
                _context8.next = 13;
                return self.web3.utils.toHex(gas);

              case 13:
                _context8.t1 = _context8.sent;
                _context8.next = 16;
                return self.web3.utils.toHex(2000000);

              case 16:
                _context8.t2 = _context8.sent;
                _context8.t3 = address;
                _context8.t4 = callData;
                _context8.t5 = signer;
                rawTx = {
                  nonce: _context8.t0,
                  gasPrice: _context8.t1,
                  gasLimit: _context8.t2,
                  to: _context8.t3,
                  data: _context8.t4,
                  from: _context8.t5
                };
                tx = new TX(rawTx, 3);

                tx.sign(this.hexToBuffer(self.privateKey));
                serialized = tx.serialize();
                _context8.next = 26;
                return self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));

              case 26:
                txHash = _context8.sent;
                _context8.next = 29;
                return this.waitForConfirm(txHash);

              case 29:
                return _context8.abrupt('return', txHash);

              case 30:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function executeCloseChannel(_x37, _x38, _x39, _x40) {
        return _ref8.apply(this, arguments);
      }

      return executeCloseChannel;
    }(),

    executeFinalizeCloseChannel: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(contractABI, address, chanID, signer) {
        var c, callData, gas, nonce, rawTx, tx, serialized, txHash;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                c = new self.web3.eth.Contract(contractABI, address);
                callData = c.methods.closeWithTimeoutSubchannel(this.serializeState([chanID])).encodeABI();
                _context9.next = 4;
                return self.web3.eth.getGasPrice();

              case 4:
                gas = _context9.sent;
                _context9.next = 7;
                return self.web3.eth.getTransactionCount(signer);

              case 7:
                nonce = _context9.sent;
                _context9.next = 10;
                return self.web3.utils.toHex(nonce);

              case 10:
                _context9.t0 = _context9.sent;
                _context9.next = 13;
                return self.web3.utils.toHex(gas);

              case 13:
                _context9.t1 = _context9.sent;
                _context9.next = 16;
                return self.web3.utils.toHex(2000000);

              case 16:
                _context9.t2 = _context9.sent;
                _context9.t3 = address;
                _context9.t4 = callData;
                _context9.t5 = signer;
                rawTx = {
                  nonce: _context9.t0,
                  gasPrice: _context9.t1,
                  gasLimit: _context9.t2,
                  to: _context9.t3,
                  data: _context9.t4,
                  from: _context9.t5
                };
                tx = new TX(rawTx, 3);

                tx.sign(this.hexToBuffer(self.privateKey));
                serialized = tx.serialize();
                _context9.next = 26;
                return self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized));

              case 26:
                txHash = _context9.sent;
                _context9.next = 29;
                return this.waitForConfirm(txHash);

              case 29:
                return _context9.abrupt('return', txHash);

              case 30:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function executeFinalizeCloseChannel(_x41, _x42, _x43, _x44) {
        return _ref9.apply(this, arguments);
      }

      return executeFinalizeCloseChannel;
    }(),

    waitForConfirm: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(txHash) {
        var receipt;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return self.web3.eth.getTransactionReceipt(txHash.transactionHash);

              case 2:
                receipt = _context10.sent;

                if (!(receipt == null)) {
                  _context10.next = 10;
                  break;
                }

                _context10.next = 6;
                return this.timeout(1000);

              case 6:
                _context10.next = 8;
                return this.waitForConfirm(txHash);

              case 8:
                _context10.next = 11;
                break;

              case 10:
                return _context10.abrupt('return');

              case 11:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function waitForConfirm(_x45) {
        return _ref10.apply(this, arguments);
      }

      return waitForConfirm;
    }(),

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