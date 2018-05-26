const web3 = require('web3-latest');
var BigNumber = require('bignumber.js');

class RandomPieceGenerator {

  constructor(seed, length) {
    this.hashes = [];
    this.currentRound = 0;
    this.seed = seed;
    for(let i = 0; i < length; i++) {
      const lastHash = this.hashes[this.hashes.length - 1] || seed;
      this.hashes.push(web3.utils.soliditySha3(lastHash));
    }
  }

  getRandom(roundNumber) {
    return this.hashes[this.hashes.length - roundNumber];
  }

  getNextRandom() {
    this.currentRound++;
    const hash = this.hashes[this.hashes.length - this.currentRound] || this.seed;
    return hash;
  }

}

class MergedRandomGenerator {

  constructor(initialHashA, initialHashB) {
    this.lastHashA = initialHashA;
    this.lastHashB = initialHashB;
    this.lastHash = web3.utils.soliditySha3(this.lastHashA, this.lastHashB);
  }

  getCurrentRandom() {
    return this.lastHash;
  }

  getNextRandom(preimageA, preimageB) {
    const hashedPreimageA = web3.utils.soliditySha3(preimageA);
    const hashedPreimageB = web3.utils.soliditySha3(preimageB);
    const aMatch = hashedPreimageA === this.lastHashA;
    const bMatch = hashedPreimageB === this.lastHashB;
    if (!aMatch) {
      throw JSON.stringify({
        message: 'Preimage from A does not cycle into correct value',
        preimageA,
        hashedPreimageA,
        lastHashA: this.lastHashA
      });
    }
    if (!bMatch) {
      throw 'Preimage from B does not cycle into correct value';
    }
    this.lastHashA = preimageA;
    this.lastHashB = preimageB;
    this.lastHash = web3.utils.soliditySha3(this.lastHashA, this.lastHashB);
    const number = new BigNumber(this.lastHash);
    return number;
  }

}

exports.RandomPieceGenerator = RandomPieceGenerator;
exports.MergedRandomGenerator = MergedRandomGenerator;
