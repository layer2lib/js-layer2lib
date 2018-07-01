'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')
const GunProxy = require('layer2storage').GunStorageProxy

const Gun = require('gun')
require('gun/lib/then.js')
require('gun/lib/unset.js')
require('gun/lib/open.js')
const gun = new Gun({ radisk: false, localStorage: true })

async function test(_db) {
  // ALICE
  const proxyAlice = new GunProxy(_db, `layer2/Alice`);
  let optionsAlice = {
    //db: {set: function(){}},
    db: proxyAlice,
    privateKey: '0x2c339e1afdbfd0b724a4793bf73ec3a4c235cceb131dcd60824a06cefbef9875'
  }

  let lAlice = new Layer2lib('https://rinkeby.infura.io', optionsAlice)

  let lcOptions = {

  }


  const lcS0 = {
    partyA: '0xd4EA3b21C312D7C6a1c744927a6F80Fe226A8416',
    partyI: '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe',
    balanceA: '0.5',
    balanceI: '1'
  }

  await lAlice.setPayment.init()
  const id = await lAlice.setPayment.createLC(lcS0)
  let lc0Stored = await lAlice.setPayment.getLC(id)
  console.log(lc0Stored) 
}

test(gun)