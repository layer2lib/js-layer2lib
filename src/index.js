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
  constructor(options) {
    web3.setProvider(new web3.providers.HttpProvider(options.provider))
    this.web3 = web3
    
    this.merkleTree = Merkle
    this.utils = utils

    this.db = options.db
    this.gsc = GSC(this)
  }

  async getMainnetBalance(address) {
    return web3.fromWei(web3.eth.getBalance(address), 'ether')
  }

  async initGSC(options) {
    this.gsc.init(options)
  }

  async createGSCAgreement(options) {
    this.gsc.openAgreement(options)
  }

  async getGSCAgreement(ID) {
    let res = await this.gsc.findAgreement(ID)
    return res
  }

  async joinGSCAgreement(aggrement) {

  }
}

module.exports = Layer2lib