'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Gun = require('gun')
require('gun/lib/then.js')
require('gun/lib/unset.js')
require('gun/lib/open.js')
require('gun/lib/load.js')
require('gun/lib/not.js')
require('gun/lib/path.js')

const Layer2lib = require('../src/index.js')
const GunProxy = require('layer2storage').GunStorageProxy

const gun = new Gun({ radisk: false, localStorage: true })
const gun1 = new Gun({ radisk: false, localStorage: true })
const gun2 = new Gun({ radisk: false, localStorage: true })

async function test(_db1, _db2, _db3) {
  let _partyA = '0xd4EA3b21C312D7C6a1c744927a6F80Fe226A8416'
  let _partyB = 'b1dd709d7eb8138f25b71103d41d50ba8708e816'
  let _partyI = '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe'

  // ALICE
  const proxyAlice = new GunProxy(_db1, `layer2/Alice`);
  let optionsAlice = {
    db: proxyAlice,
    privateKey: '0x9eb0e84b7cadfcbbec8d49ae7112b25e0c1cb158ecd2160c301afa1f4a1029c8'
  }

  let lAlice = new Layer2lib('https://rinkeby.infura.io', optionsAlice)

  const lcS0 = {
    partyA: _partyA,
    partyI: _partyI,
    balanceA: '0.000001',
    balanceI: '0.00002'
  }


  await lAlice.setPayment.init()
  const id = await lAlice.setPayment.createLC(lcS0)
  let lc0Stored = await lAlice.setPayment.getLC(id)
  console.log(lc0Stored)


  // Bob
  const proxyBob = new GunProxy(_db2, `layer2/Bob`);
  let optionsBob = {
    db: proxyBob,
    privateKey: '0x42b83487fcc52252abd33f7c1d32006545388d0036e1ed3ae75c86a62a5c85d1'
  }

  let lBob = new Layer2lib('https://rinkeby.infura.io', optionsBob)

  const lcS0_b = {
    partyA: _partyB,
    partyI: _partyI,
    balanceA: '0.000004',
    balanceI: '0.00002'
  }


  await lBob.setPayment.init()
  const id_b = await lBob.setPayment.createLC(lcS0_b)
  let lc0Stored_b = await lBob.setPayment.getLC(id_b)


  // Ingrid
  const proxyIngrid = new GunProxy(_db3, `layer2/Ingrid`);
  let optionsIngrid = {
    db: proxyIngrid,
    privateKey: '0x2c339e1afdbfd0b724a4793bf73ec3a4c235cceb131dcd60824a06cefbef9875'
  }

  let lIngrid = new Layer2lib('https://rinkeby.infura.io', optionsIngrid)
  await lIngrid.setPayment.init()
  // todo: await lIngrid.setPayment.validateLCState(lc0Stored)
  // cannot get alice / bob state by id until we have a system that watches for updates
  // await lIngrid.setPayment.joinLC(id)
  // await lIngrid.setPayment.joinLC(id_b)
  await lIngrid.setPayment.joinLC(lc0Stored)
  await lIngrid.setPayment.joinLC(lc0Stored_b)

  // todo get sig from some update mechanism, then update database for alice
  let lc0Stored2 = await lAlice.setPayment.getLC(id) // this should not have ingrids sig on it
  let lc0Stored2_b = await lIngrid.setPayment.getLC(id_b)
  console.log(lc0Stored2)

  // generate new lc state with vc state in it
  const vcS0 = {
    lcid: id,
    partyA: _partyA,
    partyB: _partyB,
    balanceA: '0.000005',
    balanceB: '0.000004'
  }

  let vcid = await lAlice.setPayment.openVC(vcS0)
  let vc0Stored = await lAlice.setPayment.getVC(vcid)

  // bob joins when they see a request with given vcid
  // find some way to get the state from alice to bob's db
  //await lBob.setPayment.joinVC(vc_id)

  let lcS1 = lc0Stored2


  await lAlice.setPayment.updateLC(lc0Stored)

  // both alice and bob update request to hub db for their lc channels



  // Close channel

  const lcS2 = {
    id: id,
    partyA: _partyA,
    partyI: _partyI,
    balanceA: '0.000001',
    balanceI: '0.00002'
  }

  await lAlice.setPayment.initiateCloseLC(lcS2)
  let lc1Stored = await lAlice.setPayment.getLC(id)
  //console.log(lc1Stored)

  await lIngrid.setPayment.confirmCloseLC(id)
}

test(gun, gun1, gun2)