'use strict'
require('babel-core/register')
require('babel-polyfill')

const Web3 = require('web3')
const web3 = new Web3()
const GSC = require('./general-state-channel')
const SET = require('./set-payment-channels')
const Merkle = require('./MerkleTree')

const BrowserStorageProxy = require('./storage/BrowerStorageProxy')
const RedisStorageProxy = require('./storage/RedisStorageProxy')
const MemStorageProxy = require('./storage/MemStorageProxy')
const FirebaseStorageProxy = require('./storage/FirebaseStorageProxy')

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
    this.utils = utils(this)

    if (!options.db) throw new Error('Require DB object');
    if (!options.db.set)
      throw new Error('Not a valid DB object');

    this.storage = options.db
    this.gsc = GSC(this)
    this.set = SET(this)


    // TODO: store encrypted private key, require password to unlock and sign
    this.privateKey = options.privateKey
  }

  async getMainnetBalance(address) {
    const balance = await web3.eth.getBalance(address)
    return web3.utils.fromWei(balance, 'ether')
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

  async joinGSCAgreement(agreement, state) {
    await this.gsc.joinAgreement(agreement, state)
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

Layer2lib.BrowserStorageProxy = BrowserStorageProxy;
Layer2lib.RedisStorageProxy = RedisStorageProxy;
Layer2lib.MemStorageProxy = MemStorageProxy;
Layer2lib.FirebaseStorageProxy = FirebaseStorageProxy;

module.exports = Layer2lib
