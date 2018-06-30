'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')
const Promise = require('bluebird')
const GunProxy = require('layer2storage').GunStorageProxy

const Gun = require('gun')
const gun = new Gun()

async function test(_db) {
  // ALICE
  const proxyAlice = new GunProxy(_db, `layer2/Alice`);
  let optionsAlice = {
    //db: {set: function(){}},
    db: proxyAlice,
    privateKey: '0x0'
  }

  let lAlice = new Layer2lib('https://rinkeby.infura.io', optionsAlice)

  let lcOptions = {

  }

  lAlice.setPayment.init()
  lAlice.setPayment.createLC()
}

test(gun)