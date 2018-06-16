'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var web3 = require('web3');
var BigNumber = require('bignumber.js');

var RandomPieceGenerator = function () {
  function RandomPieceGenerator(seed, length) {
    _classCallCheck(this, RandomPieceGenerator);

    this.hashes = [];
    this.currentRound = 0;
    this.seed = seed;
    for (var i = 0; i < length; i++) {
      var lastHash = this.hashes[this.hashes.length - 1] || seed;
      this.hashes.push(web3.utils.soliditySha3(lastHash));
    }
  }

  _createClass(RandomPieceGenerator, [{
    key: 'getRandom',
    value: function getRandom(roundNumber) {
      return this.hashes[this.hashes.length - roundNumber];
    }
  }, {
    key: 'getNextRandom',
    value: function getNextRandom() {
      this.currentRound++;
      var hash = this.hashes[this.hashes.length - this.currentRound] || this.seed;
      return hash;
    }
  }]);

  return RandomPieceGenerator;
}();

var MergedRandomGenerator = function () {
  function MergedRandomGenerator(initialHashA, initialHashB) {
    _classCallCheck(this, MergedRandomGenerator);

    this.lastHashA = initialHashA;
    this.lastHashB = initialHashB;
    this.lastHash = web3.utils.soliditySha3(this.lastHashA, this.lastHashB);
  }

  _createClass(MergedRandomGenerator, [{
    key: 'getCurrentRandom',
    value: function getCurrentRandom() {
      return this.lastHash;
    }
  }, {
    key: 'getNextRandom',
    value: function getNextRandom(preimageA, preimageB) {
      var hashedPreimageA = web3.utils.soliditySha3(preimageA);
      var hashedPreimageB = web3.utils.soliditySha3(preimageB);
      var aMatch = hashedPreimageA === this.lastHashA;
      var bMatch = hashedPreimageB === this.lastHashB;
      if (!aMatch) {
        throw JSON.stringify({
          message: 'Preimage from A does not cycle into correct value',
          preimageA: preimageA,
          hashedPreimageA: hashedPreimageA,
          lastHashA: this.lastHashA
        });
      }
      if (!bMatch) {
        throw 'Preimage from B does not cycle into correct value';
      }
      this.lastHashA = preimageA;
      this.lastHashB = preimageB;
      this.lastHash = web3.utils.soliditySha3(this.lastHashA, this.lastHashB);
      var number = new BigNumber(this.lastHash);
      return number;
    }
  }]);

  return MergedRandomGenerator;
}();

exports.RandomPieceGenerator = RandomPieceGenerator;
exports.MergedRandomGenerator = MergedRandomGenerator;