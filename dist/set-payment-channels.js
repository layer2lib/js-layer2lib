'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var LC = require('../contracts/LedgerChannel.json');
var EC = require('../contracts/ECTools.json');
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
                self.ledgerchannels = '0xe6b119eca4dc6852c027e5d50a0e544a67b41b84';

              case 1:
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

    createLC: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(options) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function createLC(_x2) {
        return _ref2.apply(this, arguments);
      }

      return createLC;
    }(),

    // TODO: Replace agreement with just the state sig from counterparty
    joinLC: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function joinLC() {
        return _ref3.apply(this, arguments);
      }

      return joinLC;
    }(),

    updateLC: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(channel) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function updateLC(_x3) {
        return _ref4.apply(this, arguments);
      }

      return updateLC;
    }(),

    initiateCloseChannel: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(agreementID) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function initiateCloseChannel(_x4) {
        return _ref5.apply(this, arguments);
      }

      return initiateCloseChannel;
    }(),

    confirmCloseChannel: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(agreement, state) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function confirmCloseChannel(_x5, _x6) {
        return _ref6.apply(this, arguments);
      }

      return confirmCloseChannel;
    }(),

    finalizeChannel: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(agreementID) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function finalizeChannel(_x7) {
        return _ref7.apply(this, arguments);
      }

      return finalizeChannel;
    }(),

    // channel functions

    // IF battle eth channel
    // Alice creates channel agreement for Bob with Ingrid
    // Bob confirms and creates agreement for Alice with Ingrid
    openVC: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(channel) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function openVC(_x8) {
        return _ref8.apply(this, arguments);
      }

      return openVC;
    }(),

    // TODO: replace agreement param with signature
    // you must respond to any request before updating any other state (everything pulls from latest)
    joinVC: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(channel, agreement, channelState) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function joinVC(_x9, _x10, _x11) {
        return _ref9.apply(this, arguments);
      }

      return joinVC;
    }(),

    // When Ingrid receives both agreements
    hubConfirmVC: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(channelA, channelB, agreementA, agreementB, channelState) {
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

      function hubConfirmVC(_x12, _x13, _x14, _x15, _x16) {
        return _ref10.apply(this, arguments);
      }

      return hubConfirmVC;
    }(),

    // TODO: before updating any channel state we should check that the channel
    // is not closed. Check previous channel state for close flag
    initiateUpdateVCState: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(id, updateState) {
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

      function initiateUpdateVCState(_x17, _x18) {
        return _ref11.apply(this, arguments);
      }

      return initiateUpdateVCState;
    }(),

    confirmVCUpdate: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(updateVC, updateState) {
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

      function confirmVCUpdate(_x19, _x20) {
        return _ref12.apply(this, arguments);
      }

      return confirmVCUpdate;
    }(),

    isVCOpen: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(agreementID) {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function isVCOpen(_x21) {
        return _ref13.apply(this, arguments);
      }

      return isVCOpen;
    }(),

    startSettleLC: function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(channelID) {
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

      function startSettleLC(_x22) {
        return _ref14.apply(this, arguments);
      }

      return startSettleLC;
    }(),

    challengeSettleLC: function () {
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(channelID) {
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function challengeSettleLC(_x23) {
        return _ref15.apply(this, arguments);
      }

      return challengeSettleLC;
    }(),

    // Byzantine functions

    startSettleVC: function () {
      var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(agreementID) {
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function startSettleVC(_x24) {
        return _ref16.apply(this, arguments);
      }

      return startSettleVC;
    }(),

    challengeSettleVC: function () {
      var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(agreementID) {
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function challengeSettleVC(_x25) {
        return _ref17.apply(this, arguments);
      }

      return challengeSettleVC;
    }(),

    closeByzantineVC: function () {
      var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(agreementID) {
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function closeByzantineVC(_x26) {
        return _ref18.apply(this, arguments);
      }

      return closeByzantineVC;
    }(),

    closeByzantineLC: function () {
      var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(channelID) {
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
              case 'end':
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function closeByzantineLC(_x27) {
        return _ref19.apply(this, arguments);
      }

      return closeByzantineLC;
    }(),

    _verifyUpdate: function _verifyUpdate(updateAgreement, currentAgreement, currentChannel, updateState) {},

    getLC: function () {
      var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(agreementID) {
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
              case 'end':
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function getLC(_x28) {
        return _ref20.apply(this, arguments);
      }

      return getLC;
    }(),

    getAllLCs: function () {
      var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
              case 'end':
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function getAllLCs() {
        return _ref21.apply(this, arguments);
      }

      return getAllLCs;
    }(),

    getAllVCs: function () {
      var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
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

      function getAllVCs() {
        return _ref22.apply(this, arguments);
      }

      return getAllVCs;
    }(),

    getAllTransactions: function () {
      var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23() {
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
              case 'end':
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function getAllTransactions() {
        return _ref23.apply(this, arguments);
      }

      return getAllTransactions;
    }(),

    getAllRawStates: function () {
      var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
              case 'end':
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function getAllRawStates() {
        return _ref24.apply(this, arguments);
      }

      return getAllRawStates;
    }(),

    getVC: function () {
      var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(channelID) {
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
              case 'end':
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function getVC(_x29) {
        return _ref25.apply(this, arguments);
      }

      return getVC;
    }(),

    getTransaction: function () {
      var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(agreementID) {
        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
              case 'end':
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function getTransaction(_x30) {
        return _ref26.apply(this, arguments);
      }

      return getTransaction;
    }(),

    getState: function () {
      var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(ID) {
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
              case 'end':
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function getState(_x31) {
        return _ref27.apply(this, arguments);
      }

      return getState;
    }(),

    updateLCSigsDB: function () {
      var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(channel) {
        return regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
              case 'end':
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function updateLCSigsDB(_x32) {
        return _ref28.apply(this, arguments);
      }

      return updateLCSigsDB;
    }(),

    syncDatabase: function () {
      var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(agreement) {
        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
              case 'end':
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function syncDatabase(_x33) {
        return _ref29.apply(this, arguments);
      }

      return syncDatabase;
    }(),

    clearStorage: function () {
      var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30() {
        return regeneratorRuntime.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                _context30.next = 2;
                return self.storage.set('agreements', {});

              case 2:
                _context30.next = 4;
                return self.storage.set('transactions', {});

              case 4:
                _context30.next = 6;
                return self.storage.set('states', {});

              case 6:
                _context30.next = 8;
                return self.storage.set('channels', {});

              case 8:
                _context30.next = 10;
                return self.storage.set('virtuals', {});

              case 10:
              case 'end':
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function clearStorage() {
        return _ref30.apply(this, arguments);
      }

      return clearStorage;
    }()
  };
};