'use strict'

const Web3 = require('web3')
const web3 = new Web3()
const GSC = require('./general-state-channel')

// const config = require('./config')
// replaced by repo-browser when running in browser
// const defaultRepo = require('./runtime/repo-nodejs')

exports = module.exports

class Layer2lib {
  constructor(provider) {
    this.gsc = GSC(this)
    
    web3.setProvider(new web3.providers.HttpProvider(provider))
  }

  async getMainnetBalance(address) {
    return web3.fromWei(web3.eth.getBalance(address), 'ether')
  }
}

module.exports = Layer2lib