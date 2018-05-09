'use strict'

const Web3 = require('web3')
const web3 = new Web3()
const GSC = require('./general-state-channel')
const Merkle = require('./MerkleTree')

const utils = require('./utils')

// const config = require('./config')
// replaced by repo-browser when running in browser
// const defaultRepo = require('./runtime/repo-nodejs')

exports = module.exports

class Layer2lib {
  constructor(provider) {
    web3.setProvider(new web3.providers.HttpProvider(provider))
    this.web3 = web3
    
    this.merkleTree = Merkle
    this.utils = utils

    this.gsc = GSC(this)
  }

  async getMainnetBalance(address) {
    return web3.fromWei(web3.eth.getBalance(address), 'ether')
  }
}

module.exports = Layer2lib