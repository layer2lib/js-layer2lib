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
    db: proxyAlice,
    privateKey: '0x9eb0e84b7cadfcbbec8d49ae7112b25e0c1cb158ecd2160c301afa1f4a1029c8'
  }

  let lAlice = new Layer2lib('https://rinkeby.infura.io', optionsAlice)

  const lcS0 = {
    partyA: '0xd4EA3b21C312D7C6a1c744927a6F80Fe226A8416',
    partyI: '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe',
    balanceA: '0.000001',
    balanceI: '0.00002'
  }

  await lAlice.setPayment.init()
  const id = await lAlice.setPayment.createLC(lcS0)
  let lc0Stored = await lAlice.setPayment.getLC(id)

  // Ingrid
  const proxyIngrid = new GunProxy(_db, `layer2/Ingrid`);
  let optionsIngrid = {
    db: proxyIngrid,
    privateKey: '0x2c339e1afdbfd0b724a4793bf73ec3a4c235cceb131dcd60824a06cefbef9875'
  }

  let lIngrid = new Layer2lib('https://rinkeby.infura.io', optionsIngrid)
  await lIngrid.setPayment.init()
  // todo: await lIngrid.setPayment.validateLCState(lc0Stored)
  await lIngrid.setPayment.joinLC(lc0Stored)

  let lc0Stored2 = await lIngrid.setPayment.getLC(id)

  // generate new lc state with vc state in it

  //await lAlice.setPayment.updateLC(lc0Stored)

}

test(gun)