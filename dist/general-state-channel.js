'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var metachannel = require('../contracts/general-state-channels/build/contracts/MetaChannel.json');
var msig = require('../contracts/general-state-channels/build/contracts/MultiSig.json');
var reg = require('../contracts/general-state-channels/build/contracts/CTFRegistry.json');
var BigNumber = require('bignumber.js');

module.exports = function gsc(self) {
  return {
    init: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // TODO: Check against counterfactual registry and see if any
                // of the channels are being challenged when online
                self.etherExtension = '0x32c1d681fe917170573aed0671d21317f14219fd';
                self.bidirectEtherInterpreter = '0x74926af30d35337e45225666bbf49e156fd08016';
                self.battleEtherInterpreter = '0x0';
                self.registryAddress = '0x72be812074e5618786f1953662b8af1ec344231c';

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x) {
        return _ref.apply(this, arguments);
      }

      return init;
    }(),

    createAgreement: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(agreement) {
        var entryID, agreements, txs, rawStates, metaByteCode, args, signers, metaCTFbytes, metachannelCTFaddress, metaSig, mr, ms, mv, msigs, initialState, stateHash, state0sig, r, s, v, sigs, msigBytecode, msigArgs, msigDeployBytes, msigAddress, openTxHash, tx;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                entryID = agreement.ID;
                _context2.next = 3;
                return self.storage.get('agreements');

              case 3:
                _context2.t0 = _context2.sent;

                if (_context2.t0) {
                  _context2.next = 6;
                  break;
                }

                _context2.t0 = {};

              case 6:
                agreements = _context2.t0;

                if (!agreements.hasOwnProperty(entryID)) agreements[entryID] = {};

                // OVERWRITE OLD DATABASE TX ENTRIES IF THEY EXIST FOR THIS AGREEMENT
                _context2.next = 10;
                return self.storage.get('transactions');

              case 10:
                _context2.t1 = _context2.sent;

                if (_context2.t1) {
                  _context2.next = 13;
                  break;
                }

                _context2.t1 = {};

              case 13:
                txs = _context2.t1;

                if (!txs.hasOwnProperty(entryID)) txs[entryID] = [];

                _context2.next = 17;
                return self.storage.get('states');

              case 17:
                _context2.t2 = _context2.sent;

                if (_context2.t2) {
                  _context2.next = 20;
                  break;
                }

                _context2.t2 = {};

              case 20:
                rawStates = _context2.t2;

                if (!rawStates.hasOwnProperty(entryID)) rawStates[entryID] = [];

                agreement.openPending = true;
                agreement.closed = false;
                agreement.inDispute = false;
                agreement.metaSignatures = [];
                agreement.channels = [];
                agreement.channelRootHash = '0x0';

                metaByteCode = metachannel.bytecode;
                args = ['test42042', agreement.partyA, agreement.partyB];
                signers = [agreement.partyA, agreement.partyB];
                metaCTFbytes = self.utils.getCTFstate(metaByteCode, signers, args);
                metachannelCTFaddress = self.utils.getCTFaddress(metaCTFbytes);
                //let metachannelCTFaddress = '1337'

                rawStates[metachannelCTFaddress] = metaCTFbytes;

                agreement.metachannelCTFaddress = metachannelCTFaddress;
                agreement.metachannelCTFbytes = metaCTFbytes;
                metaSig = self.utils.sign(agreement.metachannelCTFaddress, self.privateKey);
                mr = self.utils.bufferToHex(metaSig.r);
                ms = self.utils.bufferToHex(metaSig.s);
                mv = metaSig.v;
                msigs = [[mr, ms, mv]];


                agreement.metaSignatures = msigs;

                initialState = [];

                initialState.push(0); // is close
                initialState.push(0); // sequence
                initialState.push(agreement.partyA); // partyA address
                initialState.push(agreement.partyB); // partyB address
                initialState.push(metachannelCTFaddress); // counterfactual metachannel address
                initialState.push('0x0'); // sub-channel root hash
                initialState.push(agreement.balanceA); // balance in ether partyA
                initialState.push(agreement.balanceB); // balance in ether partyB

                rawStates[entryID].push(initialState);

                agreement.stateSerialized = self.utils.serializeState(initialState);

                stateHash = self.web3.utils.sha3(agreement.stateSerialized, { encoding: 'hex' });

                agreement.stateSignatures = [];
                state0sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(state0sig.r);
                s = self.utils.bufferToHex(state0sig.s);
                v = state0sig.v;
                sigs = [[r, s, v]];


                agreement.stateSignatures = [];
                agreement.stateSignatures[0] = sigs;

                // TODO deploy and call openAgreement on msig wallet
                // save msig deploy address to agreement object
                msigBytecode = msig.bytecode;
                msigArgs = [msigBytecode, metachannelCTFaddress, self.registryAddress];
                msigDeployBytes = self.utils.serializeState(msigArgs);
                _context2.next = 67;
                return self.utils.deployContract(msigDeployBytes, agreement.partyA);

              case 67:
                msigAddress = _context2.sent;

                //let msigAddress = msig_tx_hash
                agreement.address = msigAddress;

                // TODO: call deployed msig
                _context2.next = 71;
                return self.utils.executeOpenAgreement(msig.abi, msigAddress, agreement.stateSerialized, self.etherExtension, sigs[0], agreement.balanceA, agreement.partyA);

              case 71:
                openTxHash = _context2.sent;
                tx = {
                  agreement: agreement.ID,
                  channel: 'master',
                  nonce: 0,
                  timestamp: Date.now(),
                  data: 'Open Agreement',
                  txHash: openTxHash
                };

                txs[entryID].push(tx);

                self.publicKey = self.utils.bufferToHex(self.utils.ecrecover(stateHash, state0sig.v, state0sig.r, state0sig.s));

                Object.assign(agreements[entryID], agreement);
                // Object.assign(txs[entryID], txList)
                // Object.assign(rawStates[entryID], rawStatesList)

                _context2.next = 78;
                return self.storage.set('agreements', agreements);

              case 78:
                _context2.next = 80;
                return self.storage.set('transactions', txs);

              case 80:
                _context2.next = 82;
                return self.storage.set('states', rawStates);

              case 82:
                console.log('Agreement and tx stored in db, deploying contract');

              case 83:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function createAgreement(_x2) {
        return _ref2.apply(this, arguments);
      }

      return createAgreement;
    }(),

    // TODO: Replace agreement with just the state sig from counterparty
    joinAgreement: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(agreement, state) {
        var entryID, agreements, txs, rawStates, stateHash, sig, r, s, v, sigs, metaSig, mr, ms, mv, msigs, joinTxHash, tx;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                entryID = agreement.ID;
                _context3.next = 3;
                return self.storage.get('agreements');

              case 3:
                _context3.t0 = _context3.sent;

                if (_context3.t0) {
                  _context3.next = 6;
                  break;
                }

                _context3.t0 = {};

              case 6:
                agreements = _context3.t0;

                if (!agreements.hasOwnProperty(entryID)) agreements[entryID] = {};

                _context3.next = 10;
                return self.storage.get('transactions');

              case 10:
                _context3.t1 = _context3.sent;

                if (_context3.t1) {
                  _context3.next = 13;
                  break;
                }

                _context3.t1 = {};

              case 13:
                txs = _context3.t1;

                if (!txs.hasOwnProperty(entryID)) txs[entryID] = [];

                _context3.next = 17;
                return self.storage.get('states');

              case 17:
                _context3.t2 = _context3.sent;

                if (_context3.t2) {
                  _context3.next = 20;
                  break;
                }

                _context3.t2 = {};

              case 20:
                rawStates = _context3.t2;

                if (!rawStates.hasOwnProperty(entryID)) rawStates[entryID] = [];

                rawStates[entryID].push(state);
                rawStates[agreement.metachannelCTFaddress] = agreement.metachannelCTFbytes;

                stateHash = self.web3.utils.sha3(agreement.stateSerialized, { encoding: 'hex' });
                sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(sig.r);
                s = self.utils.bufferToHex(sig.s);
                v = sig.v;
                sigs = [r, s, v];
                metaSig = self.utils.sign(agreement.metachannelCTFaddress, self.privateKey);
                mr = self.utils.bufferToHex(metaSig.r);
                ms = self.utils.bufferToHex(metaSig.s);
                mv = metaSig.v;
                msigs = [mr, ms, mv];


                agreement.metaSignatures.push(msigs);
                agreement.stateSignatures[0].push(sigs);
                agreement.openPending = false;

                self.publicKey = self.utils.bufferToHex(self.utils.ecrecover(stateHash, sig.v, sig.r, sig.s));

                _context3.next = 41;
                return self.utils.executeJoinAgreement(msig.abi, agreement.address, agreement.stateSerialized, self.etherExtension, agreement.stateSignatures[0][1], agreement.balanceB, agreement.partyB);

              case 41:
                joinTxHash = _context3.sent;
                tx = {
                  agreement: agreement.ID,
                  channel: 'master',
                  nonce: 0,
                  timestamp: Date.now(),
                  data: 'Join Agreement',
                  txHash: joinTxHash
                };

                txs[entryID].push(tx);

                Object.assign(agreements[entryID], agreement);
                // Object.assign(txs[entryID], txList)
                // Object.assign(rawStates[entryID], rawStatesList)

                _context3.next = 47;
                return self.storage.set('agreements', agreements);

              case 47:
                _context3.next = 49;
                return self.storage.set('transactions', txs);

              case 49:
                _context3.next = 51;
                return self.storage.set('states', rawStates);

              case 51:

                console.log('Agreement stored in db, responding to deployed contract');

              case 52:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function joinAgreement(_x3, _x4) {
        return _ref3.apply(this, arguments);
      }

      return joinAgreement;
    }(),

    updateAgreement: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(agreement) {
        var entryID, agreements;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                entryID = agreement.ID;
                _context4.next = 3;
                return self.storage.get('agreements');

              case 3:
                _context4.t0 = _context4.sent;

                if (_context4.t0) {
                  _context4.next = 6;
                  break;
                }

                _context4.t0 = {};

              case 6:
                agreements = _context4.t0;

                if (!agreements.hasOwnProperty(entryID)) agreements[entryID] = {};

                Object.assign(agreements[entryID], agreement);

                _context4.next = 11;
                return self.storage.set('agreements', agreements);

              case 11:

                console.log('Agreement Sigs updated in db');

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function updateAgreement(_x5) {
        return _ref4.apply(this, arguments);
      }

      return updateAgreement;
    }(),

    updateChannel: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(channel) {
        var entryID, channels;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                entryID = channel.ID;
                _context5.next = 3;
                return self.storage.get('channels');

              case 3:
                _context5.t0 = _context5.sent;

                if (_context5.t0) {
                  _context5.next = 6;
                  break;
                }

                _context5.t0 = {};

              case 6:
                channels = _context5.t0;

                if (!channels.hasOwnProperty(entryID)) channels[entryID] = {};

                Object.assign(channels[entryID], channel);

                _context5.next = 11;
                return self.storage.set('channels', channels);

              case 11:

                console.log('Channel Sigs updated in db');

              case 12:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function updateChannel(_x6) {
        return _ref5.apply(this, arguments);
      }

      return updateChannel;
    }(),

    updateChannelSigs: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(channel) {
        var entryID, channels;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                entryID = channel.ID;
                _context6.next = 3;
                return self.storage.get('channels');

              case 3:
                _context6.t0 = _context6.sent;

                if (_context6.t0) {
                  _context6.next = 6;
                  break;
                }

                _context6.t0 = {};

              case 6:
                channels = _context6.t0;

                if (channels.hasOwnProperty(entryID)) {
                  _context6.next = 9;
                  break;
                }

                return _context6.abrupt('return');

              case 9:

                Object.assign(channels[entryID], channel);

                _context6.next = 12;
                return self.storage.set('channels', channel);

              case 12:

                console.log('Channel Sigs updated in db');

              case 13:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function updateChannelSigs(_x7) {
        return _ref6.apply(this, arguments);
      }

      return updateChannelSigs;
    }(),

    initiateCloseAgreement: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(agreementID) {
        var agreements, txs, rawStates, agreement, stateLength, oldState, stateHash, sig, r, s, v, sigs, tx;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return self.storage.get('agreements');

              case 2:
                _context7.t0 = _context7.sent;

                if (_context7.t0) {
                  _context7.next = 5;
                  break;
                }

                _context7.t0 = {};

              case 5:
                agreements = _context7.t0;

                if (agreements.hasOwnProperty(agreementID)) {
                  _context7.next = 8;
                  break;
                }

                return _context7.abrupt('return');

              case 8:
                _context7.next = 10;
                return self.storage.get('transactions');

              case 10:
                _context7.t1 = _context7.sent;

                if (_context7.t1) {
                  _context7.next = 13;
                  break;
                }

                _context7.t1 = {};

              case 13:
                txs = _context7.t1;

                if (txs.hasOwnProperty(agreementID)) {
                  _context7.next = 16;
                  break;
                }

                return _context7.abrupt('return');

              case 16:
                _context7.next = 18;
                return self.storage.get('states');

              case 18:
                _context7.t2 = _context7.sent;

                if (_context7.t2) {
                  _context7.next = 21;
                  break;
                }

                _context7.t2 = {};

              case 21:
                rawStates = _context7.t2;

                if (rawStates.hasOwnProperty(agreementID)) {
                  _context7.next = 24;
                  break;
                }

                return _context7.abrupt('return');

              case 24:
                agreement = agreements[agreementID];

                agreement.closed = true;
                stateLength = rawStates[agreementID].length - 1;
                oldState = JSON.parse(JSON.stringify(rawStates[agreementID][stateLength]));


                oldState[0] = 1;
                oldState[1] = oldState[1] + 1;

                rawStates[agreementID].push(oldState);
                agreement.stateSerialized = self.utils.serializeState(oldState);

                stateHash = self.web3.utils.sha3(agreement.stateSerialized, { encoding: 'hex' });
                sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(sig.r);
                s = self.utils.bufferToHex(sig.s);
                v = sig.v;
                sigs = [[r, s, v]];


                agreement.stateSignatures[agreement.stateSignatures.length] = sigs;

                tx = {
                  agreement: agreement.ID,
                  channel: 'master',
                  nonce: oldState[1],
                  timestamp: Date.now(),
                  data: 'close Agreement',
                  txHash: '0x0'
                };

                txs[agreementID].push(tx);

                Object.assign(agreements[agreementID], agreement);
                // Object.assign(txs[entryID], txList)
                // Object.assign(rawStates[entryID], rawStatesList)

                _context7.next = 44;
                return self.storage.set('agreements', agreements);

              case 44:
                _context7.next = 46;
                return self.storage.set('transactions', txs);

              case 46:
                _context7.next = 48;
                return self.storage.set('states', rawStates);

              case 48:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function initiateCloseAgreement(_x8) {
        return _ref7.apply(this, arguments);
      }

      return initiateCloseAgreement;
    }(),

    confirmCloseAgreement: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(agreement, state) {
        var agreementID, agreements, txs, rawStates, stateHash, sig, r, s, v, sigs, tx;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                agreementID = agreement.ID;
                _context8.next = 3;
                return self.storage.get('agreements');

              case 3:
                _context8.t0 = _context8.sent;

                if (_context8.t0) {
                  _context8.next = 6;
                  break;
                }

                _context8.t0 = {};

              case 6:
                agreements = _context8.t0;

                if (agreements.hasOwnProperty(agreementID)) {
                  _context8.next = 9;
                  break;
                }

                return _context8.abrupt('return');

              case 9:
                _context8.next = 11;
                return self.storage.get('transactions');

              case 11:
                _context8.t1 = _context8.sent;

                if (_context8.t1) {
                  _context8.next = 14;
                  break;
                }

                _context8.t1 = {};

              case 14:
                txs = _context8.t1;

                if (txs.hasOwnProperty(agreementID)) {
                  _context8.next = 17;
                  break;
                }

                return _context8.abrupt('return');

              case 17:
                _context8.next = 19;
                return self.storage.get('states');

              case 19:
                _context8.t2 = _context8.sent;

                if (_context8.t2) {
                  _context8.next = 22;
                  break;
                }

                _context8.t2 = {};

              case 22:
                rawStates = _context8.t2;

                if (rawStates.hasOwnProperty(agreementID)) {
                  _context8.next = 25;
                  break;
                }

                return _context8.abrupt('return');

              case 25:

                rawStates[agreementID].push(state[state.length - 1]);

                stateHash = self.web3.utils.sha3(agreement.stateSerialized, { encoding: 'hex' });
                sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(sig.r);
                s = self.utils.bufferToHex(sig.s);
                v = sig.v;
                sigs = [r, s, v];


                agreement.stateSignatures[agreement.stateSignatures.length - 1].push(sigs);

                tx = {
                  agreement: agreement.ID,
                  channel: 'master',
                  nonce: '99',
                  timestamp: Date.now(),
                  data: 'close Agreement',
                  txHash: '0x0'
                };

                txs[agreementID].push(tx);

                Object.assign(agreements[agreementID], agreement);
                // Object.assign(txs[entryID], txList)
                // Object.assign(rawStates[entryID], rawStatesList)

                _context8.next = 38;
                return self.storage.set('agreements', agreements);

              case 38:
                _context8.next = 40;
                return self.storage.set('transactions', txs);

              case 40:
                _context8.next = 42;
                return self.storage.set('states', rawStates);

              case 42:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function confirmCloseAgreement(_x9, _x10) {
        return _ref8.apply(this, arguments);
      }

      return confirmCloseAgreement;
    }(),

    finalizeAgreement: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(agreementID) {
        var agreements, agreement, finalTxHash;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return self.storage.get('agreements');

              case 2:
                _context9.t0 = _context9.sent;

                if (_context9.t0) {
                  _context9.next = 5;
                  break;
                }

                _context9.t0 = {};

              case 5:
                agreements = _context9.t0;

                if (agreements.hasOwnProperty(agreementID)) {
                  _context9.next = 8;
                  break;
                }

                return _context9.abrupt('return');

              case 8:
                agreement = agreements[agreementID];
                _context9.next = 11;
                return self.utils.executeCloseAgreement(msig.abi, agreement.address, agreement.stateSerialized, agreement.stateSignatures[agreement.stateSignatures.length - 1], agreement.partyB // TODO: dont assume which party is calling this, it may be neither
                );

              case 11:
                finalTxHash = _context9.sent;

              case 12:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function finalizeAgreement(_x11) {
        return _ref9.apply(this, arguments);
      }

      return finalizeAgreement;
    }(),

    startSettleAgreement: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(agreementID) {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function startSettleAgreement(_x12) {
        return _ref10.apply(this, arguments);
      }

      return startSettleAgreement;
    }(),

    challengeAgreement: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(agreementID) {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function challengeAgreement(_x13) {
        return _ref11.apply(this, arguments);
      }

      return challengeAgreement;
    }(),

    closeByzantineAgreement: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(agreementID) {
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function closeByzantineAgreement(_x14) {
        return _ref12.apply(this, arguments);
      }

      return closeByzantineAgreement;
    }(),

    isAgreementOpen: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(agreementID) {
        var agreements, agreement;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return self.storage.get('agreements');

              case 2:
                _context13.t0 = _context13.sent;

                if (_context13.t0) {
                  _context13.next = 5;
                  break;
                }

                _context13.t0 = {};

              case 5:
                agreements = _context13.t0;

                if (agreements.hasOwnProperty(agreementID)) {
                  _context13.next = 8;
                  break;
                }

                return _context13.abrupt('return', false);

              case 8:
                agreement = agreements[agreementID];

                if (!(agreement.openPending == true)) {
                  _context13.next = 11;
                  break;
                }

                return _context13.abrupt('return', false);

              case 11:
                if (!(agreement.stateSignatures[0].length != 2)) {
                  _context13.next = 13;
                  break;
                }

                return _context13.abrupt('return', false);

              case 13:
                return _context13.abrupt('return', true);

              case 14:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function isAgreementOpen(_x15) {
        return _ref13.apply(this, arguments);
      }

      return isAgreementOpen;
    }(),

    // channel functions

    // When Ingrid receives both agreements
    hubConfirmVC: function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(channelA, channelB, agreementA, agreementB, channelState) {
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function hubConfirmVC(_x16, _x17, _x18, _x19, _x20) {
        return _ref14.apply(this, arguments);
      }

      return hubConfirmVC;
    }(),

    // IF battle eth channel
    // Alice creates channel agreement for Bob with Ingrid
    // Bob confirms and creates agreement for Alice with Ingrid
    openChannel: function () {
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(channel) {
        var AgreeEntryID, agreements, agreement, ChanEntryID, channels, rawStates, txs, channelInputs, elem, elems, i, merkle, channelRoot, oldStates, newState, stateHash, sig, r, s, v, sigs, tx_nonce, tx;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                AgreeEntryID = channel.agreementID;
                _context15.next = 3;
                return self.storage.get('agreements');

              case 3:
                _context15.t0 = _context15.sent;

                if (_context15.t0) {
                  _context15.next = 6;
                  break;
                }

                _context15.t0 = {};

              case 6:
                agreements = _context15.t0;

                if (agreements.hasOwnProperty(AgreeEntryID)) {
                  _context15.next = 9;
                  break;
                }

                return _context15.abrupt('return');

              case 9:
                agreement = agreements[AgreeEntryID];
                ChanEntryID = channel.ID;
                _context15.next = 13;
                return self.storage.get('channels');

              case 13:
                _context15.t1 = _context15.sent;

                if (_context15.t1) {
                  _context15.next = 16;
                  break;
                }

                _context15.t1 = {};

              case 16:
                channels = _context15.t1;

                if (!channels.hasOwnProperty(ChanEntryID)) channels[ChanEntryID] = {};

                _context15.next = 20;
                return self.storage.get('states');

              case 20:
                _context15.t2 = _context15.sent;

                if (_context15.t2) {
                  _context15.next = 23;
                  break;
                }

                _context15.t2 = {};

              case 23:
                rawStates = _context15.t2;

                if (!rawStates.hasOwnProperty(ChanEntryID)) rawStates[ChanEntryID] = [];

                if (rawStates.hasOwnProperty(AgreeEntryID)) {
                  _context15.next = 27;
                  break;
                }

                return _context15.abrupt('return');

              case 27:
                _context15.next = 29;
                return self.storage.get('transactions');

              case 29:
                _context15.t3 = _context15.sent;

                if (_context15.t3) {
                  _context15.next = 32;
                  break;
                }

                _context15.t3 = {};

              case 32:
                txs = _context15.t3;

                if (!txs.hasOwnProperty(ChanEntryID)) txs[ChanEntryID] = [];

                channel.openPending = true;
                channel.inDispute = false;

                channelInputs = [];


                if (channel.type == 'ether') {
                  channelInputs.push(0); // is close
                  channelInputs.push(0); // is force push channel
                  channelInputs.push(0); // channel sequence
                  channelInputs.push(0); // timeout length ms
                  channelInputs.push(self.bidirectEtherInterpreter); // ether payment interpreter library address
                  channelInputs.push(channel.ID); // ID of channel
                  channelInputs.push(agreement.metachannelCTFaddress); // counterfactual metachannel address
                  channelInputs.push(self.registryAddress); // CTF registry address
                  channelInputs.push('0x0'); // channel tx roothash
                  channelInputs.push(agreement.partyA); // partyA in the channel
                  channelInputs.push(agreement.partyB); // partyB in the channel
                  channelInputs.push(channel.balanceA); // balance of party A in channel (ether)
                  channelInputs.push(channel.balanceB); // balance of party B in channel (ether)
                }

                if (channel.type == 'battleEther') {
                  channelInputs.push(0); // is close
                  channelInputs.push(1); // is force push channel
                  channelInputs.push(0); // channel sequence
                  channelInputs.push(0); // timeout length ms
                  channelInputs.push(self.battleEtherInterpreter); // ether payment interpreter library address
                  channelInputs.push(channel.ID); // ID of channel
                  channelInputs.push(agreement.metachannelCTFaddress); // counterfactual metachannel address
                  channelInputs.push(self.registryAddress); // CTF registry address
                  channelInputs.push('0x0'); // channel tx roothash
                  channelInputs.push(agreement.partyA); // partyA in the channel
                  channelInputs.push(channel.counterparty); // partyB in the channel
                  channelInputs.push(agreement.partyB); // partyI in the channel

                  channelInputs.push(channel.balanceA); // balance of party A in channel (ether)
                  channelInputs.push(channel.balanceB); // balance of party B in channel (ether)
                  channelInputs.push(channel.bond); // how much of a bond does ingrid put in
                }

                rawStates[ChanEntryID].push(channelInputs);
                channel.stateSerialized = self.utils.serializeState(channelInputs);
                channel.stateRaw = channelInputs;

                // calculate channel root hash
                elem = self.utils.sha3(channel.stateSerialized, { encoding: 'hex' });
                elems = [];

                agreement.channels = agreement.channels || [];
                for (i = 0; i < agreement.channels.length; i++) {
                  elems.push(self.utils.hexToBuffer(agreement.channels[i]));
                }

                elems.push(self.utils.hexToBuffer(elem));

                // add new element to the agreements lits of channels
                agreement.channels.push(elem);

                merkle = new self.merkleTree(elems);

                // put root hash in agreement state

                channelRoot = self.utils.bufferToHex(merkle.getRoot());

                agreement.channelRootHash = channelRoot;

                // serialize and sign s1 of agreement state
                oldStates = rawStates[AgreeEntryID];

                // grab latest state and modify it

                newState = JSON.parse(JSON.stringify(oldStates[oldStates.length - 1]));

                newState[5] = channelRoot;
                // set nonce
                newState[1]++;
                agreement.nonce = newState[1];

                // TODO module this
                if (agreement.types[0] === 'Ether') {
                  //adjust balance on agreement state
                  newState[6] = newState[6] - channel.balanceA;
                  newState[7] = newState[7] - channel.balanceB;
                  // update ether agreement balance
                  agreement.balanceA = agreement.balanceA - channel.balanceA;
                  agreement.balanceB = agreement.balanceB - channel.balanceB;
                }

                // push the new sig of new state into agreement object
                rawStates[AgreeEntryID].push(newState);

                agreement.stateSerialized = self.utils.serializeState(newState);

                stateHash = self.web3.utils.sha3(agreement.stateSerialized, { encoding: 'hex' });
                sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(sig.r);
                s = self.utils.bufferToHex(sig.s);
                v = sig.v;
                sigs = [[r, s, v]];


                agreement.stateSignatures[agreement.stateSignatures.length] = sigs;

                tx_nonce = void 0;

                if (txs[ChanEntryID].length === 0) {
                  tx_nonce = 0;
                } else {
                  tx_nonce = txs[ChanEntryID][txs[ChanEntryID].length - 1].nonce++;
                }

                tx = {
                  agreement: agreement.ID,
                  channel: channel.ID,
                  nonce: tx_nonce,
                  timestamp: Date.now(),
                  data: 'Open Channel',
                  txHash: '0x0'
                };

                txs[ChanEntryID].push(tx);

                // store the channel
                Object.assign(channels[ChanEntryID], channel);
                _context15.next = 73;
                return self.storage.set('channels', channels);

              case 73:

                // store the new agreement
                Object.assign(agreements[AgreeEntryID], agreement);
                _context15.next = 76;
                return self.storage.set('agreements', agreements);

              case 76:
                _context15.next = 78;
                return self.storage.set('states', rawStates);

              case 78:
                _context15.next = 80;
                return self.storage.set('transactions', txs);

              case 80:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function openChannel(_x21) {
        return _ref15.apply(this, arguments);
      }

      return openChannel;
    }(),

    // TODO: replace agreement param with signature
    // you must respond to any request before updating any other state (everything pulls from latest)
    joinChannel: function () {
      var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(channel, agreement, channelState) {
        var AgreeEntryID, agreements, ChanEntryID, channels, rawStates, txs, oldStates, newState, stateHash, sig, r, s, v, sigs, tx_nonce, tx;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                AgreeEntryID = agreement.ID;
                _context16.next = 3;
                return self.storage.get('agreements');

              case 3:
                _context16.t0 = _context16.sent;

                if (_context16.t0) {
                  _context16.next = 6;
                  break;
                }

                _context16.t0 = {};

              case 6:
                agreements = _context16.t0;

                if (agreements.hasOwnProperty(AgreeEntryID)) {
                  _context16.next = 9;
                  break;
                }

                return _context16.abrupt('return');

              case 9:
                ChanEntryID = channel.ID;
                _context16.next = 12;
                return self.storage.get('channels');

              case 12:
                _context16.t1 = _context16.sent;

                if (_context16.t1) {
                  _context16.next = 15;
                  break;
                }

                _context16.t1 = {};

              case 15:
                channels = _context16.t1;

                if (!channels.hasOwnProperty(ChanEntryID)) channels[ChanEntryID] = {};

                _context16.next = 19;
                return self.storage.get('states');

              case 19:
                _context16.t2 = _context16.sent;

                if (_context16.t2) {
                  _context16.next = 22;
                  break;
                }

                _context16.t2 = {};

              case 22:
                rawStates = _context16.t2;

                if (!rawStates.hasOwnProperty(ChanEntryID)) rawStates[ChanEntryID] = [];

                if (rawStates.hasOwnProperty(AgreeEntryID)) {
                  _context16.next = 26;
                  break;
                }

                return _context16.abrupt('return');

              case 26:
                _context16.next = 28;
                return self.storage.get('transactions');

              case 28:
                _context16.t3 = _context16.sent;

                if (_context16.t3) {
                  _context16.next = 31;
                  break;
                }

                _context16.t3 = {};

              case 31:
                txs = _context16.t3;

                if (!txs.hasOwnProperty(ChanEntryID)) txs[ChanEntryID] = [];

                rawStates[ChanEntryID].push(channelState);

                // serialize and sign s1 of agreement state
                oldStates = rawStates[AgreeEntryID];

                // grab latest state and modify it

                newState = JSON.parse(JSON.stringify(oldStates[oldStates.length - 1]));


                newState[5] = agreement.channelRootHash;
                // set nonce
                newState[1]++;
                agreement.nonce = newState[1];

                // TODO module this
                if (agreement.types[0] === 'Ether') {
                  //adjust balance on agreement state
                  newState[6] = newState[6] - channel.balanceA;
                  newState[7] = newState[7] - channel.balanceB;
                  // HACKY
                  // // update ether agreement balance
                  // agreement.balanceA = agreement.balanceA - channel.balanceA
                  // agreement.balanceB = agreement.balanceB - channel.balanceB
                }

                // push the new sig of new state into agreement object
                rawStates[AgreeEntryID].push(newState);

                // TODO: Check the incoming agreement (from Alice) on new channel creation
                // has Alices signature. When signatures are in their own database, in append
                // only log format keyed by the channel or agreement they belong to, we will
                // check that the ecrecover of the raw channel state passed matches the supplied
                // sig. ecrecover(rawChannelStateHash, sig)

                //TODO: check that the channel state provided is valid

                // let channelHash = self.web3.utils.sha3(channel.stateSerialized, {encoding: 'hex'})

                // // calculate channel root hash
                // let elem = self.utils.sha3(channelHash)

                // let elems = []
                // for(var i=0; i<agreement.channels.length; i++) { elems.push(agreement.channels[i]) }

                // elems.push(self.utils.hexToBuffer(elem))

                // let merkle = new self.merkleTree(elems)

                // // check root hash in agreement state
                // let channelRoot = self.utils.bufferToHex(merkle.getRoot())

                // if(channelRoot != agreement.stateRaw[4]) return


                stateHash = self.web3.utils.sha3(agreement.stateSerialized, { encoding: 'hex' });
                sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(sig.r);
                s = self.utils.bufferToHex(sig.s);
                v = sig.v;
                sigs = [r, s, v];


                agreement.stateSignatures[agreement.stateSignatures.length - 1].push(sigs);
                channel.openPending = false;

                tx_nonce = void 0;

                if (txs[ChanEntryID].length === 0) {
                  tx_nonce = 0;
                } else {
                  tx_nonce = txs[ChanEntryID][txs[ChanEntryID].length - 1].nonce++;
                }

                tx = {
                  agreement: agreement.ID,
                  channel: channel.ID,
                  nonce: tx_nonce,
                  timestamp: Date.now(),
                  data: 'Join Channel',
                  txHash: '0x0'
                };

                txs[ChanEntryID].push(tx);

                // store the channel
                Object.assign(channels[ChanEntryID], channel);
                _context16.next = 56;
                return self.storage.set('channels', channels);

              case 56:

                // store the new agreement
                Object.assign(agreements[AgreeEntryID], agreement);
                _context16.next = 59;
                return self.storage.set('agreements', agreements);

              case 59:
                _context16.next = 61;
                return self.storage.set('states', rawStates);

              case 61:
                _context16.next = 63;
                return self.storage.set('transactions', txs);

              case 63:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function joinChannel(_x22, _x23, _x24) {
        return _ref16.apply(this, arguments);
      }

      return joinChannel;
    }(),

    // TODO: before updating any channel state we should check that the channel
    // is not closed. Check previous channel state for close flag
    initiateUpdateChannelState: function () {
      var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(id, updateState) {
        var ChanEntryID, channels, channel, AgreeEntryID, agreements, agreement, rawStates, txs, l, chanState, oldChanStateCpy, oldStateHash, l2, agreementState, elem, elems, i, merkle, channelRoot, oldStates, newState, stateHash, sig, r, s, v, sigs, tx_nonce, tx;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                ChanEntryID = id;
                _context17.next = 3;
                return self.storage.get('channels');

              case 3:
                _context17.t0 = _context17.sent;

                if (_context17.t0) {
                  _context17.next = 6;
                  break;
                }

                _context17.t0 = {};

              case 6:
                channels = _context17.t0;

                if (channels.hasOwnProperty(ChanEntryID)) {
                  _context17.next = 9;
                  break;
                }

                return _context17.abrupt('return');

              case 9:
                _context17.next = 11;
                return this.getChannel(ChanEntryID);

              case 11:
                channel = _context17.sent;
                AgreeEntryID = channel.agreementID;
                _context17.next = 15;
                return self.storage.get('agreements');

              case 15:
                _context17.t1 = _context17.sent;

                if (_context17.t1) {
                  _context17.next = 18;
                  break;
                }

                _context17.t1 = {};

              case 18:
                agreements = _context17.t1;

                if (agreements.hasOwnProperty(AgreeEntryID)) {
                  _context17.next = 21;
                  break;
                }

                return _context17.abrupt('return');

              case 21:
                _context17.next = 23;
                return this.getAgreement(AgreeEntryID);

              case 23:
                agreement = _context17.sent;
                _context17.next = 26;
                return self.storage.get('states');

              case 26:
                _context17.t2 = _context17.sent;

                if (_context17.t2) {
                  _context17.next = 29;
                  break;
                }

                _context17.t2 = {};

              case 29:
                rawStates = _context17.t2;

                if (rawStates.hasOwnProperty(ChanEntryID)) {
                  _context17.next = 32;
                  break;
                }

                return _context17.abrupt('return');

              case 32:
                if (rawStates.hasOwnProperty(AgreeEntryID)) {
                  _context17.next = 34;
                  break;
                }

                return _context17.abrupt('return');

              case 34:
                _context17.next = 36;
                return self.storage.get('transactions');

              case 36:
                _context17.t3 = _context17.sent;

                if (_context17.t3) {
                  _context17.next = 39;
                  break;
                }

                _context17.t3 = {};

              case 39:
                txs = _context17.t3;

                if (txs.hasOwnProperty(ChanEntryID)) {
                  _context17.next = 42;
                  break;
                }

                return _context17.abrupt('return');

              case 42:
                l = rawStates[ChanEntryID].length;
                chanState = rawStates[ChanEntryID][l - 1].slice(0);
                oldChanStateCpy = rawStates[ChanEntryID][l - 1].slice(0);

                // get old channel hash

                oldStateHash = self.utils.sha3(channel.stateSerialized, { encoding: 'hex' });
                l2 = rawStates[AgreeEntryID].length;
                agreementState = rawStates[AgreeEntryID][l2 - 1].slice(0);

                // TODO: create modules for each interpreter type

                if (channel.type == 'ether') {
                  channel.balanceA = updateState.balanceA;
                  channel.balanceB = updateState.balanceB;

                  chanState[0] = updateState.isClose;
                  chanState[2]++;
                  chanState[11] = updateState.balanceA;
                  chanState[12] = updateState.balanceB;

                  //addjust agreement balance if close
                  if (updateState.isClose === 1) {
                    agreement.balanceA = parseInt(agreement.balanceA) + parseInt(chanState[11]);
                    agreement.balanceB = parseInt(agreement.balanceB) + parseInt(chanState[12]);
                    agreement.channelRootHash = '0x0';
                    chanState[11] = 0;
                    chanState[12] = 0;
                    channel.balanceA = 0;
                    channel.balanceB = 0;
                  }
                }

                // TODO !!!!!!!!!!!!!!!!!!!
                // This will transfer the ledger wager based on winner
                console.log(channel.type);
                if (channel.type == 'battleEther') {
                  console.log('WEEEÉ');
                  if (updateState.isClose === 1) {}
                }

                rawStates[ChanEntryID].push(chanState);

                channel.stateSerialized = self.utils.serializeState(chanState);
                channel.stateRaw = chanState;

                // calculate channel root hash
                elem = self.utils.sha3(channel.stateSerialized, { encoding: 'hex' });


                agreement.channels = agreement.channels || [];
                elems = agreement.channels.slice(0);


                for (i = 0; i < agreement.channels.length; i++) {
                  if (oldStateHash === elems[i]) {
                    agreement.channels[i] = elem;
                    elems[i] = elem;
                  }
                  elems[i] = self.utils.hexToBuffer(elems[i]);
                }

                merkle = new self.merkleTree(elems);

                // put root hash in agreement state

                channelRoot = self.utils.bufferToHex(merkle.getRoot());

                agreement.channelRootHash = channelRoot;

                // serialize and sign s1 of agreement state
                oldStates = rawStates[AgreeEntryID];

                // grab latest state and modify it

                newState = JSON.parse(JSON.stringify(oldStates[oldStates.length - 1]));

                newState[5] = channelRoot;
                newState[1]++;
                agreement.nonce = newState[1];

                if (updateState.isClose === 1) {
                  newState[5] = '0x0';
                  newState[6] = agreement.balanceA;
                  newState[7] = agreement.balanceB;
                }
                // push the new sig of new state into agreement object
                rawStates[AgreeEntryID].push(newState);

                agreement.stateSerialized = self.utils.serializeState(newState);

                stateHash = self.web3.utils.sha3(agreement.stateSerialized, { encoding: 'hex' });
                sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(sig.r);
                s = self.utils.bufferToHex(sig.s);
                v = sig.v;
                sigs = [[r, s, v]];


                agreement.stateSignatures[agreement.stateSignatures.length] = sigs;

                tx_nonce = void 0;

                if (txs[ChanEntryID].length === 0) {
                  tx_nonce = 0;
                } else {
                  tx_nonce = txs[ChanEntryID][txs[ChanEntryID].length - 1].nonce;
                  tx_nonce++;
                }

                tx = {
                  agreement: agreement.ID,
                  channel: channel.ID,
                  nonce: tx_nonce,
                  timestamp: Date.now(),
                  data: updateState,
                  txHash: self.web3.utils.sha3(updateState.toString(), { encoding: 'hex' })
                };

                txs[ChanEntryID].push(tx);

                // store the channel
                Object.assign(channels[ChanEntryID], channel);
                _context17.next = 83;
                return self.storage.set('channels', channels);

              case 83:

                // store the new agreement
                Object.assign(agreements[AgreeEntryID], agreement);
                _context17.next = 86;
                return self.storage.set('agreements', agreements);

              case 86:
                _context17.next = 88;
                return self.storage.set('states', rawStates);

              case 88:
                _context17.next = 90;
                return self.storage.set('transactions', txs);

              case 90:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function initiateUpdateChannelState(_x25, _x26) {
        return _ref17.apply(this, arguments);
      }

      return initiateUpdateChannelState;
    }(),

    initiateUpdateVCstate: function () {
      var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(id, updateState) {
        var txs, ChanEntryID, channels, channel, AgreeEntryID, agreements, agreement, rawStates, virtuals, virtual, attackTable, damage, vInputs, stateHash, sig, r, s, v, sigs;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                _context18.next = 2;
                return self.storage.get('transactions');

              case 2:
                _context18.t0 = _context18.sent;

                if (_context18.t0) {
                  _context18.next = 5;
                  break;
                }

                _context18.t0 = {};

              case 5:
                txs = _context18.t0;

                if (txs.hasOwnProperty(id)) {
                  _context18.next = 8;
                  break;
                }

                return _context18.abrupt('return');

              case 8:
                ChanEntryID = updateState.channelID;
                _context18.next = 11;
                return self.storage.get('channels');

              case 11:
                _context18.t1 = _context18.sent;

                if (_context18.t1) {
                  _context18.next = 14;
                  break;
                }

                _context18.t1 = {};

              case 14:
                channels = _context18.t1;

                if (channels.hasOwnProperty(ChanEntryID)) {
                  _context18.next = 17;
                  break;
                }

                return _context18.abrupt('return');

              case 17:
                _context18.next = 19;
                return this.getChannel(ChanEntryID);

              case 19:
                channel = _context18.sent;
                AgreeEntryID = channel.agreementID;
                _context18.next = 23;
                return self.storage.get('agreements');

              case 23:
                _context18.t2 = _context18.sent;

                if (_context18.t2) {
                  _context18.next = 26;
                  break;
                }

                _context18.t2 = {};

              case 26:
                agreements = _context18.t2;

                if (agreements.hasOwnProperty(AgreeEntryID)) {
                  _context18.next = 29;
                  break;
                }

                return _context18.abrupt('return');

              case 29:
                agreement = agreements[AgreeEntryID];
                _context18.next = 32;
                return self.storage.get('states');

              case 32:
                _context18.t3 = _context18.sent;

                if (_context18.t3) {
                  _context18.next = 35;
                  break;
                }

                _context18.t3 = {};

              case 35:
                rawStates = _context18.t3;
                _context18.next = 38;
                return self.storage.get('virtual');

              case 38:
                _context18.t4 = _context18.sent;

                if (_context18.t4) {
                  _context18.next = 41;
                  break;
                }

                _context18.t4 = {};

              case 41:
                virtuals = _context18.t4;

                if (!virtuals.hasOwnProperty(id)) virtuals[id] = {};

                // TODO: ensure party A is calling this to start battle
                virtual = channel;
                attackTable = ['12', '6', '25'];

                // TODO: Calculate damage on counterparty based on random halves and attack chosen

                damage = attackTable[updateState.attack];

                console.log('DAMAGE: ' + damage);
                console.log(updateState.attack);
                // TODO verify damage and ultimate isn't called early

                // require updateState.attack is in index
                // attatch Alice random seed half for the attack
                virtual.AliceSeed = updateState.randomA;
                virtual.BobSeed = updateState.randomB;

                vInputs = [];

                vInputs.push(updateState.isClose); // is close
                vInputs.push(1); // is force push channel
                vInputs.push(1); // channel sequence
                vInputs.push(updateState.nonce); // timeout length ms
                vInputs.push(self.battleEtherInterpreter); // ether payment interpreter library address
                vInputs.push(channel.ID); // ID of channel
                vInputs.push(agreement.metachannelCTFaddress); // counterfactual metachannel address
                vInputs.push(self.registryAddress); // CTF registry address
                vInputs.push('0x0'); // channel tx roothash
                vInputs.push(agreement.partyA); // partyA in the channel
                vInputs.push(channel.counterparty); // partyB in the channel
                vInputs.push(agreement.partyB); // partyI in the channel
                vInputs.push(channel.balanceA); // balance of party A in channel (ether)
                vInputs.push(channel.balanceB); // balance of party B in channel (ether)
                vInputs.push(channel.bond); // how much of a bond does ingrid put in
                vInputs.push(updateState.hpA);
                vInputs.push(updateState.hpB);
                vInputs.push(updateState.attack);
                vInputs.push(virtual.AliceSeed);
                vInputs.push(virtual.BobSeed);
                vInputs.push(updateState.ultimateNonceA);
                vInputs.push(updateState.ultimateNonceB);
                vInputs.push(updateState.turn); // Mark whos turn it is, must be other person for next state update

                // TODO If attack is ulimate (last attack in index) then update the ultimateNonce == sequence

                virtual.stateSerialized = self.utils.serializeState(vInputs);
                virtual.stateRaw = vInputs;

                stateHash = self.web3.utils.sha3(virtual.stateSerialized, { encoding: 'hex' });
                sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(sig.r);
                s = self.utils.bufferToHex(sig.s);
                v = sig.v;
                sigs = [r, s, v];


                virtual.stateSignatures = [];

                rawStates[ChanEntryID] = [];
                rawStates[ChanEntryID].push(vInputs);

                virtual.stateSignatures[virtual.stateSignatures.length] = sigs;

                // store the channel
                Object.assign(virtuals[ChanEntryID], virtual);
                _context18.next = 89;
                return self.storage.set('virtuals', virtuals);

              case 89:
                _context18.next = 91;
                return self.storage.set('states', rawStates);

              case 91:
                _context18.next = 93;
                return self.storage.set('transactions', txs);

              case 93:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function initiateUpdateVCstate(_x27, _x28) {
        return _ref18.apply(this, arguments);
      }

      return initiateUpdateVCstate;
    }(),

    confirmVCUpdate: function () {
      var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(updateVC, updateState) {
        var id, txs, channels, channel, rawStates, virtuals, virtual, vInputs, stateHash, sig, r, s, v, sigs;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                id = updateVC.channelID;
                _context19.next = 3;
                return self.storage.get('transactions');

              case 3:
                _context19.t0 = _context19.sent;

                if (_context19.t0) {
                  _context19.next = 6;
                  break;
                }

                _context19.t0 = {};

              case 6:
                txs = _context19.t0;

                if (txs.hasOwnProperty(id)) {
                  _context19.next = 9;
                  break;
                }

                return _context19.abrupt('return');

              case 9:
                _context19.next = 11;
                return self.storage.get('channels');

              case 11:
                _context19.t1 = _context19.sent;

                if (_context19.t1) {
                  _context19.next = 14;
                  break;
                }

                _context19.t1 = {};

              case 14:
                channels = _context19.t1;

                if (channels.hasOwnProperty(id)) {
                  _context19.next = 17;
                  break;
                }

                return _context19.abrupt('return');

              case 17:
                _context19.next = 19;
                return this.getChannel(id);

              case 19:
                channel = _context19.sent;
                _context19.next = 22;
                return self.storage.get('states');

              case 22:
                _context19.t2 = _context19.sent;

                if (_context19.t2) {
                  _context19.next = 25;
                  break;
                }

                _context19.t2 = {};

              case 25:
                rawStates = _context19.t2;
                _context19.next = 28;
                return self.storage.get('virtual');

              case 28:
                _context19.t3 = _context19.sent;

                if (_context19.t3) {
                  _context19.next = 31;
                  break;
                }

                _context19.t3 = {};

              case 31:
                virtuals = _context19.t3;

                if (!virtuals.hasOwnProperty(id)) virtuals[id] = {};

                // TODO: ensure party A is calling this to start battle
                virtual = updateVC;
                vInputs = virtual.stateRaw;
                stateHash = self.web3.utils.sha3(virtual.stateSerialized, { encoding: 'hex' });
                sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(sig.r);
                s = self.utils.bufferToHex(sig.s);
                v = sig.v;
                sigs = [r, s, v];


                virtual.stateSignatures = [];

                rawStates[id] = [];
                rawStates[id].push(vInputs);

                virtual.stateSignatures[virtual.stateSignatures.length].push(sigs);

                // store the channel
                Object.assign(virtuals[id], virtual);
                _context19.next = 48;
                return self.storage.set('virtuals', virtuals);

              case 48:
                _context19.next = 50;
                return self.storage.set('states', rawStates);

              case 50:
                _context19.next = 52;
                return self.storage.set('transactions', txs);

              case 52:
              case 'end':
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function confirmVCUpdate(_x29, _x30) {
        return _ref19.apply(this, arguments);
      }

      return confirmVCUpdate;
    }(),

    confirmUpdateChannelState: function () {
      var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(updateChannel, updateAgreement, updateState) {
        var ChanEntryID, channels, channel, AgreeEntryID, agreements, agreement, rawStates, txs, isValidUpdate, oldStates, newState, stateHash, sig, r, s, v, sigs, tx_nonce, tx;
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                ChanEntryID = updateChannel.ID;
                _context20.next = 3;
                return self.storage.get('channels');

              case 3:
                _context20.t0 = _context20.sent;

                if (_context20.t0) {
                  _context20.next = 6;
                  break;
                }

                _context20.t0 = {};

              case 6:
                channels = _context20.t0;

                if (channels.hasOwnProperty(ChanEntryID)) {
                  _context20.next = 9;
                  break;
                }

                return _context20.abrupt('return');

              case 9:
                _context20.next = 11;
                return this.getChannel(ChanEntryID);

              case 11:
                channel = _context20.sent;
                AgreeEntryID = channel.agreementID;
                _context20.next = 15;
                return self.storage.get('agreements');

              case 15:
                _context20.t1 = _context20.sent;

                if (_context20.t1) {
                  _context20.next = 18;
                  break;
                }

                _context20.t1 = {};

              case 18:
                agreements = _context20.t1;

                if (agreements.hasOwnProperty(AgreeEntryID)) {
                  _context20.next = 21;
                  break;
                }

                return _context20.abrupt('return');

              case 21:
                _context20.next = 23;
                return this.getAgreement(AgreeEntryID);

              case 23:
                agreement = _context20.sent;
                _context20.next = 26;
                return self.storage.get('states');

              case 26:
                _context20.t2 = _context20.sent;

                if (_context20.t2) {
                  _context20.next = 29;
                  break;
                }

                _context20.t2 = {};

              case 29:
                rawStates = _context20.t2;

                if (rawStates.hasOwnProperty(ChanEntryID)) {
                  _context20.next = 32;
                  break;
                }

                return _context20.abrupt('return');

              case 32:
                if (rawStates.hasOwnProperty(AgreeEntryID)) {
                  _context20.next = 34;
                  break;
                }

                return _context20.abrupt('return');

              case 34:
                _context20.next = 36;
                return self.storage.get('transactions');

              case 36:
                _context20.t3 = _context20.sent;

                if (_context20.t3) {
                  _context20.next = 39;
                  break;
                }

                _context20.t3 = {};

              case 39:
                txs = _context20.t3;

                if (txs.hasOwnProperty(ChanEntryID)) {
                  _context20.next = 42;
                  break;
                }

                return _context20.abrupt('return');

              case 42:

                // require this
                isValidUpdate = this._verifyUpdate(updateAgreement, agreement, channel, updateState);


                rawStates[ChanEntryID].push(updateChannel.stateRaw);

                // serialize and sign s1 of agreement state
                oldStates = rawStates[AgreeEntryID];

                // grab latest state and modify it

                newState = JSON.parse(JSON.stringify(oldStates[oldStates.length - 1]));

                newState[5] = updateAgreement.channelRootHash;
                newState[1]++;

                if (updateState.isClose === 1) {
                  newState[5] = '0x0';
                  newState[6] = updateAgreement.balanceA;
                  newState[7] = updateAgreement.balanceB;
                }

                // add latest state
                rawStates[AgreeEntryID].push(newState);

                stateHash = self.web3.utils.sha3(updateAgreement.stateSerialized, { encoding: 'hex' });
                sig = self.utils.sign(stateHash, self.privateKey);
                r = self.utils.bufferToHex(sig.r);
                s = self.utils.bufferToHex(sig.s);
                v = sig.v;
                sigs = [r, s, v];


                updateAgreement.stateSignatures[updateAgreement.stateSignatures.length - 1].push(sigs);

                tx_nonce = void 0;

                if (txs[ChanEntryID].length === 0) {
                  tx_nonce = 0;
                } else {
                  tx_nonce = txs[ChanEntryID][txs[ChanEntryID].length - 1].nonce++;
                }

                tx = {
                  agreement: agreement.ID,
                  channel: channel.ID,
                  nonce: tx_nonce,
                  timestamp: Date.now(),
                  data: updateState,
                  txHash: self.web3.utils.sha3(updateState.toString(), { encoding: 'hex' })
                };

                txs[ChanEntryID].push(tx);

                // store the channel
                Object.assign(channels[ChanEntryID], updateChannel);
                _context20.next = 64;
                return self.storage.set('channels', channels);

              case 64:

                // store the new agreement
                Object.assign(agreements[AgreeEntryID], updateAgreement);
                _context20.next = 67;
                return self.storage.set('agreements', agreements);

              case 67:
                _context20.next = 69;
                return self.storage.set('states', rawStates);

              case 69:
                _context20.next = 71;
                return self.storage.set('transactions', txs);

              case 71:
              case 'end':
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function confirmUpdateChannelState(_x31, _x32, _x33) {
        return _ref20.apply(this, arguments);
      }

      return confirmUpdateChannelState;
    }(),

    startSettleChannel: function () {
      var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(channelID) {
        var channels, channel, AgreeEntryID, agreements, agreement, rawStates, txs, metaCTFaddress, metaCTF, sigs, TxHash, chanState, agreeState, TxHash2;
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                _context21.next = 2;
                return self.storage.get('channels');

              case 2:
                _context21.t0 = _context21.sent;

                if (_context21.t0) {
                  _context21.next = 5;
                  break;
                }

                _context21.t0 = {};

              case 5:
                channels = _context21.t0;

                if (channels.hasOwnProperty(channelID)) {
                  _context21.next = 8;
                  break;
                }

                return _context21.abrupt('return');

              case 8:
                _context21.next = 10;
                return this.getChannel(channelID);

              case 10:
                channel = _context21.sent;
                AgreeEntryID = channel.agreementID;
                _context21.next = 14;
                return self.storage.get('agreements');

              case 14:
                _context21.t1 = _context21.sent;

                if (_context21.t1) {
                  _context21.next = 17;
                  break;
                }

                _context21.t1 = {};

              case 17:
                agreements = _context21.t1;

                if (agreements.hasOwnProperty(AgreeEntryID)) {
                  _context21.next = 20;
                  break;
                }

                return _context21.abrupt('return');

              case 20:
                _context21.next = 22;
                return this.getAgreement(AgreeEntryID);

              case 22:
                agreement = _context21.sent;
                _context21.next = 25;
                return self.storage.get('states');

              case 25:
                _context21.t2 = _context21.sent;

                if (_context21.t2) {
                  _context21.next = 28;
                  break;
                }

                _context21.t2 = {};

              case 28:
                rawStates = _context21.t2;

                if (rawStates.hasOwnProperty(channelID)) {
                  _context21.next = 31;
                  break;
                }

                return _context21.abrupt('return');

              case 31:
                if (rawStates.hasOwnProperty(AgreeEntryID)) {
                  _context21.next = 33;
                  break;
                }

                return _context21.abrupt('return');

              case 33:
                _context21.next = 35;
                return self.storage.get('transactions');

              case 35:
                _context21.t3 = _context21.sent;

                if (_context21.t3) {
                  _context21.next = 38;
                  break;
                }

                _context21.t3 = {};

              case 38:
                txs = _context21.t3;

                if (txs.hasOwnProperty(channelID)) {
                  _context21.next = 41;
                  break;
                }

                return _context21.abrupt('return');

              case 41:
                metaCTFaddress = agreement.metachannelCTFaddress;
                metaCTF = rawStates[metaCTFaddress];
                sigs = agreement.metaSignatures;
                _context21.next = 46;
                return self.utils.executeDeployCTF(reg.abi, self.registryAddress, metaCTF, sigs, agreement.partyB, // TODO: dont assume which party is calling this, it may be neither
                metaCTFaddress);

              case 46:
                TxHash = _context21.sent;


                agreement.metachannelDeployedAddress = TxHash;
                agreement.inDispute = true;

                chanState = rawStates[channelID];
                agreeState = rawStates[AgreeEntryID];
                _context21.next = 53;
                return self.utils.executeSettleChannel(metachannel.abi, agreement.metachannelDeployedAddress, self.utils.serializeState(chanState[chanState.length - 1]), self.utils.serializeState(agreeState[agreeState.length - 1]), agreement.stateSignatures[agreement.stateSignatures.length - 1], agreement.partyB, agreement.channels || []);

              case 53:
                TxHash2 = _context21.sent;


                // store the new agreement
                Object.assign(agreements[AgreeEntryID], agreement);
                _context21.next = 57;
                return self.storage.set('agreements', agreements);

              case 57:
              case 'end':
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function startSettleChannel(_x34) {
        return _ref21.apply(this, arguments);
      }

      return startSettleChannel;
    }(),

    challengeSettleChannel: function () {
      var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(channelID) {
        return regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
              case 'end':
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function challengeSettleChannel(_x35) {
        return _ref22.apply(this, arguments);
      }

      return challengeSettleChannel;
    }(),

    closeByzantineChannel: function () {
      var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(channelID) {
        var channels, channel, AgreeEntryID, agreements, agreement, abi, address, tx, tx2;
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                _context23.next = 2;
                return self.storage.get('channels');

              case 2:
                _context23.t0 = _context23.sent;

                if (_context23.t0) {
                  _context23.next = 5;
                  break;
                }

                _context23.t0 = {};

              case 5:
                channels = _context23.t0;

                if (channels.hasOwnProperty(channelID)) {
                  _context23.next = 8;
                  break;
                }

                return _context23.abrupt('return');

              case 8:
                _context23.next = 10;
                return this.getChannel(channelID);

              case 10:
                channel = _context23.sent;
                AgreeEntryID = channel.agreementID;
                _context23.next = 14;
                return self.storage.get('agreements');

              case 14:
                _context23.t1 = _context23.sent;

                if (_context23.t1) {
                  _context23.next = 17;
                  break;
                }

                _context23.t1 = {};

              case 17:
                agreements = _context23.t1;

                if (agreements.hasOwnProperty(AgreeEntryID)) {
                  _context23.next = 20;
                  break;
                }

                return _context23.abrupt('return');

              case 20:
                _context23.next = 22;
                return this.getAgreement(AgreeEntryID);

              case 22:
                agreement = _context23.sent;
                abi = msig.abi;
                address = agreement.address;
                _context23.next = 27;
                return self.utils.executeCloseChannel(abi, address, 'respek', agreement.partyB);

              case 27:
                tx = _context23.sent;
                _context23.next = 30;
                return self.utils.executeCloseChannel(metachannel.abi, agreement.metachannelDeployedAddress, channelID, agreement.partyB);

              case 30:
                tx2 = _context23.sent;

              case 31:
              case 'end':
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function closeByzantineChannel(_x36) {
        return _ref23.apply(this, arguments);
      }

      return closeByzantineChannel;
    }(),

    _verifyUpdate: function _verifyUpdate(updateAgreement, currentAgreement, currentChannel, updateState) {
      // get old channel hash
      var oldStateHash = self.utils.sha3(currentChannel.stateSerialized, { encoding: 'hex' });

      // TODO: create modules for each interpreter type
      if (currentChannel.type == 'ether') {
        currentChannel.stateRaw[2]++;
        currentChannel.stateRaw[11] = updateState.balanceA;
        currentChannel.stateRaw[12] = updateState.balanceB;
      }

      var newStateSerialized = self.utils.serializeState(currentChannel.stateRaw);

      // calculate channel root hash
      var elem = self.utils.sha3(newStateSerialized, { encoding: 'hex' });
      currentAgreement.channels = currentAgreement.channels || [];
      var elems = currentAgreement.channels.slice(0);

      for (var i = 0; i < currentAgreement.channels.length; i++) {
        if (oldStateHash === elems[i]) {
          elems[i] = elem;
        }
        elems[i] = self.utils.hexToBuffer(elems[i]);
      }

      var merkle = new self.merkleTree(elems);

      // put root hash in agreement state
      var channelRoot = self.utils.bufferToHex(merkle.getRoot());

      if (updateAgreement.channelRootHash === channelRoot) {
        return true;
      } else {
        return false;
      }
    },

    getAgreement: function () {
      var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(agreementID) {
        var _agreements;

        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                _context24.next = 2;
                return self.storage.get('agreements');

              case 2:
                _agreements = _context24.sent;
                return _context24.abrupt('return', _agreements[agreementID]);

              case 4:
              case 'end':
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function getAgreement(_x37) {
        return _ref24.apply(this, arguments);
      }

      return getAgreement;
    }(),

    getAllAgreements: function () {
      var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
        var _agreements;

        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                _context25.next = 2;
                return self.storage.get('agreements');

              case 2:
                _agreements = _context25.sent;
                return _context25.abrupt('return', _agreements);

              case 4:
              case 'end':
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function getAllAgreements() {
        return _ref25.apply(this, arguments);
      }

      return getAllAgreements;
    }(),

    getAllChannels: function () {
      var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
        var _channels;

        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                _context26.next = 2;
                return self.storage.get('channels');

              case 2:
                _channels = _context26.sent;
                return _context26.abrupt('return', _channels);

              case 4:
              case 'end':
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function getAllChannels() {
        return _ref26.apply(this, arguments);
      }

      return getAllChannels;
    }(),

    getAllTransactions: function () {
      var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
        var _txs;

        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                _context27.next = 2;
                return self.storage.get('transactions');

              case 2:
                _txs = _context27.sent;
                return _context27.abrupt('return', _txs);

              case 4:
              case 'end':
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function getAllTransactions() {
        return _ref27.apply(this, arguments);
      }

      return getAllTransactions;
    }(),

    getAllRawStates: function () {
      var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
        var _raw;

        return regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                _context28.next = 2;
                return self.storage.get('states');

              case 2:
                _raw = _context28.sent;
                return _context28.abrupt('return', _raw);

              case 4:
              case 'end':
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function getAllRawStates() {
        return _ref28.apply(this, arguments);
      }

      return getAllRawStates;
    }(),

    getChannel: function () {
      var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(channelID) {
        var channels;
        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                _context29.next = 2;
                return self.storage.get('channels');

              case 2:
                channels = _context29.sent;
                return _context29.abrupt('return', channels[channelID]);

              case 4:
              case 'end':
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function getChannel(_x38) {
        return _ref29.apply(this, arguments);
      }

      return getChannel;
    }(),

    getVirtuals: function () {
      var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(channelID) {
        var virtuals;
        return regeneratorRuntime.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                _context30.next = 2;
                return self.storage.get('virtuals');

              case 2:
                virtuals = _context30.sent;
                return _context30.abrupt('return', virtuals[channelID]);

              case 4:
              case 'end':
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function getVirtuals(_x39) {
        return _ref30.apply(this, arguments);
      }

      return getVirtuals;
    }(),

    getTransactions: function () {
      var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(agreementID) {
        var _txs;

        return regeneratorRuntime.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                _context31.next = 2;
                return self.storage.get('transactions');

              case 2:
                _txs = _context31.sent;
                return _context31.abrupt('return', _txs[agreementID]);

              case 4:
              case 'end':
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function getTransactions(_x40) {
        return _ref31.apply(this, arguments);
      }

      return getTransactions;
    }(),

    getStates: function () {
      var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(ID) {
        var _states;

        return regeneratorRuntime.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                _context32.next = 2;
                return self.storage.get('states');

              case 2:
                _states = _context32.sent;
                return _context32.abrupt('return', _states[ID]);

              case 4:
              case 'end':
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function getStates(_x41) {
        return _ref32.apply(this, arguments);
      }

      return getStates;
    }(),

    getHTLCs: function () {
      var _ref33 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(ID) {
        var _hashlockedTxs;

        return regeneratorRuntime.wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                _context33.next = 2;
                return self.storage.get('htlcs');

              case 2:
                _hashlockedTxs = _context33.sent;
                return _context33.abrupt('return', _hashlockedTxs[ID]);

              case 4:
              case 'end':
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }));

      function getHTLCs(_x42) {
        return _ref33.apply(this, arguments);
      }

      return getHTLCs;
    }(),

    syncDatabase: function () {
      var _ref34 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(agreement) {
        return regeneratorRuntime.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
              case 'end':
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function syncDatabase(_x43) {
        return _ref34.apply(this, arguments);
      }

      return syncDatabase;
    }(),

    clearStorage: function () {
      var _ref35 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35() {
        return regeneratorRuntime.wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                _context35.next = 2;
                return self.storage.set('agreements', {});

              case 2:
                _context35.next = 4;
                return self.storage.set('transactions', {});

              case 4:
                _context35.next = 6;
                return self.storage.set('states', {});

              case 6:
                _context35.next = 8;
                return self.storage.set('channels', {});

              case 8:
                _context35.next = 10;
                return self.storage.set('virtuals', {});

              case 10:
              case 'end':
                return _context35.stop();
            }
          }
        }, _callee35, this);
      }));

      function clearStorage() {
        return _ref35.apply(this, arguments);
      }

      return clearStorage;
    }()
  };
};