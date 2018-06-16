'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Web3 = require('web3');
var web3 = new Web3();
var GSC = require('./general-state-channel');
var Merkle = require('./MerkleTree');

var BrowserStorageProxy = require('./storage/BrowerStorageProxy');
var RedisStorageProxy = require('./storage/RedisStorageProxy');
var MemStorageProxy = require('./storage/MemStorageProxy');
var FirebaseStorageProxy = require('./storage/FirebaseStorageProxy');

var utils = require('./utils');

// const config = require('./config')
// replaced by repo-browser when running in browser
// const defaultRepo = require('./runtime/repo-nodejs')

exports = module.exports;

var Layer2lib = function () {
  function Layer2lib(providerUrl, options) {
    _classCallCheck(this, Layer2lib);

    if (!providerUrl) throw new Error('No provider URL provided');
    web3.setProvider(new web3.providers.HttpProvider(providerUrl));
    this.web3 = web3;

    this.merkleTree = Merkle;
    this.utils = utils(this);

    if (!options.db) throw new Error('Require DB object');
    if (!options.db.set) throw new Error('Not a valid DB object');

    this.storage = options.db;
    this.gsc = GSC(this);

    // TODO: store encrypted private key, require password to unlock and sign
    this.privateKey = options.privateKey;
  }

  _createClass(Layer2lib, [{
    key: 'getMainnetBalance',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(address) {
        var balance;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return web3.eth.getBalance(address);

              case 2:
                balance = _context.sent;
                return _context.abrupt('return', web3.utils.fromWei(balance, 'ether'));

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getMainnetBalance(_x) {
        return _ref.apply(this, arguments);
      }

      return getMainnetBalance;
    }()
  }, {
    key: 'initGSC',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(options) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.gsc.init(options);

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function initGSC(_x2) {
        return _ref2.apply(this, arguments);
      }

      return initGSC;
    }()
  }, {
    key: 'createGSCAgreement',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(options) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.gsc.createAgreement(options);

              case 2:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function createGSCAgreement(_x3) {
        return _ref3.apply(this, arguments);
      }

      return createGSCAgreement;
    }()
  }, {
    key: 'getGSCAgreement',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(ID) {
        var res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.gsc.getAgreement(ID);

              case 2:
                res = _context4.sent;
                return _context4.abrupt('return', res);

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getGSCAgreement(_x4) {
        return _ref4.apply(this, arguments);
      }

      return getGSCAgreement;
    }()
  }, {
    key: 'joinGSCAgreement',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(agreement, state) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.gsc.joinAgreement(agreement, state);

              case 2:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function joinGSCAgreement(_x5, _x6) {
        return _ref5.apply(this, arguments);
      }

      return joinGSCAgreement;
    }()
  }, {
    key: 'startGSCSettleAgreement',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(agreementID) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.gsc.startSettleAgreement(agreementID);

              case 2:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function startGSCSettleAgreement(_x7) {
        return _ref6.apply(this, arguments);
      }

      return startGSCSettleAgreement;
    }()
  }, {
    key: 'challengeGSCAgreement',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(agreementID) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.gsc.challengeAgreement(agreementID);

              case 2:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function challengeGSCAgreement(_x8) {
        return _ref7.apply(this, arguments);
      }

      return challengeGSCAgreement;
    }()
  }, {
    key: 'closeByzantineGSCAgreement',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(agreementID) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.gsc.closeByzantineAgreement(agreementID);

              case 2:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function closeByzantineGSCAgreement(_x9) {
        return _ref8.apply(this, arguments);
      }

      return closeByzantineGSCAgreement;
    }()
  }, {
    key: 'openGSCChannel',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(options) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.gsc.openChannel(options);

              case 2:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function openGSCChannel(_x10) {
        return _ref9.apply(this, arguments);
      }

      return openGSCChannel;
    }()
  }]);

  return Layer2lib;
}();

Layer2lib.BrowserStorageProxy = BrowserStorageProxy;
Layer2lib.RedisStorageProxy = RedisStorageProxy;
Layer2lib.MemStorageProxy = MemStorageProxy;
Layer2lib.FirebaseStorageProxy = FirebaseStorageProxy;

module.exports = Layer2lib;