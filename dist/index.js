'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
    value: async function getMainnetBalance(address) {
      var balance = await web3.eth.getBalance(address);
      return web3.utils.fromWei(balance, 'ether');
    }
  }, {
    key: 'initGSC',
    value: async function initGSC(options) {
      await this.gsc.init(options);
    }
  }, {
    key: 'createGSCAgreement',
    value: async function createGSCAgreement(options) {
      await this.gsc.createAgreement(options);
    }
  }, {
    key: 'getGSCAgreement',
    value: async function getGSCAgreement(ID) {
      var res = await this.gsc.getAgreement(ID);
      return res;
    }
  }, {
    key: 'joinGSCAgreement',
    value: async function joinGSCAgreement(agreement, state) {
      await this.gsc.joinAgreement(agreement, state);
    }
  }, {
    key: 'startGSCSettleAgreement',
    value: async function startGSCSettleAgreement(agreementID) {
      await this.gsc.startSettleAgreement(agreementID);
    }
  }, {
    key: 'challengeGSCAgreement',
    value: async function challengeGSCAgreement(agreementID) {
      await this.gsc.challengeAgreement(agreementID);
    }
  }, {
    key: 'closeByzantineGSCAgreement',
    value: async function closeByzantineGSCAgreement(agreementID) {
      await this.gsc.closeByzantineAgreement(agreementID);
    }
  }, {
    key: 'openGSCChannel',
    value: async function openGSCChannel(options) {
      await this.gsc.openChannel(options);
    }
  }]);

  return Layer2lib;
}();

Layer2lib.BrowserStorageProxy = BrowserStorageProxy;
Layer2lib.RedisStorageProxy = RedisStorageProxy;
Layer2lib.MemStorageProxy = MemStorageProxy;
Layer2lib.FirebaseStorageProxy = FirebaseStorageProxy;

module.exports = Layer2lib;