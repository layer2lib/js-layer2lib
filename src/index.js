'use strict'

const Web3 = require('web3')
const web3 = new Web3()

exports = module.exports

class Layer2lib {
  constructor(provider) {
    web3.setProvider(new web3.providers.HttpProvider(provider))
    console.log(web3.eth.accounts[0])
  }
}

var l = new Layer2lib('http://localhost:8545')

module.exports = Layer2lib