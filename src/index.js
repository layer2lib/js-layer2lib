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
  constructor(providerUrl, options) {
    if (!providerUrl) throw new Error('No provider URL provided')
    web3.setProvider(new web3.providers.HttpProvider(providerUrl))
    this.web3 = web3

    this.merkleTree = Merkle
    this.utils = utils

    if (!options.db) throw new Error('Require DB object');
    if (!options.db.set)
      throw new Error('Not a valid DB object');

    this.db = options.db
    this.gsc = GSC(this)


    // TODO: store encrypted private key, require password to unlock and sign
    this.privateKey = options.privateKey
  }

  async getMainnetBalance(address) {
    return web3.fromWei(web3.eth.getBalance(address), 'ether')
  }

  async initGSC(options) {
    await this.gsc.init(options)
  }

  async createGSCAgreement(options) {
    await this.gsc.createAgreement(options)
  }

  async getGSCAgreement(ID) {
    let res = await this.gsc.getAgreement(ID)
    return res
  }

  async joinGSCAgreement(agreement) {
    await this.gsc.joinAgreement(agreement)
  }


  async startGSCSettleAgreement(agreementID) {
    await this.gsc.startSettleAgreement(agreementID)
  }

  async challengeGSCAgreement(agreementID) {
    await this.gsc.challengeAgreement(agreementID)
  }

  async closeByzantineGSCAgreement(agreementID) {
    await this.gsc.closeByzantineAgreement(agreementID)
  }

  async openGSCChannel(options) {
    await this.gsc.openChannel(options)
  }
}

module.exports = Layer2lib