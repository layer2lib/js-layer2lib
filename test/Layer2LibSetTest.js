'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')
const Promise = require('bluebird');

//const Gun = require('gun')

async function test() {
  // ALICE
  let optionsAlice = {
    db: {set: function(){}},
    privateKey: '0x0'
  }

  let lAlice = new Layer2lib('https://rinkeby.infura.io', optionsAlice)
  //console.log(lAlice.set)
  lAlice.set.createLC()
}

test()