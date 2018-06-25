'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')
const rand = require('../src/random.js').RandomPieceGenerator
const mergeRand = require('../src/random.js').MergedRandomGenerator
const GunProxy = require('layer2storage').GunStorageProxy;

const gun = require("gun");
test(gun);

let battleEthIntAddress = '0x'
let etherPaymentExtAddress = '0x'
let CTFregistryAddress = '0x'

let attackTable = ['12', '6', '25']

async function test(gun) {
  // ALICE ----------------------
  const proxyAlice = new GunProxy(gun, `layer2/Alice`);
  let optionsAlice = {
    db: proxyAlice,
    privateKey: '0x2c339e1afdbfd0b724a4793bf73ec3a4c235cceb131dcd60824a06cefbef9875'
  }

  let lAlice = new Layer2lib("https://rinkeby.infura.io", optionsAlice)

  web3.setProvider(new web3.providers.HttpProvider('https://rinkeby.infura.io'))

  lAlice.initGSC()

  // clear database hack. Clears eveyones database if testing multiple parties on one system
  await lAlice.gsc.clearStorage()

  let agreementAlice = {
    dbSalt: 'Alice', // for testing multiple layer2 instances on same db
    ID: 'battleHub1337',
    types: ['Battle-Ether'],
    partyA: '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe', // Player Alice public Key
    partyB: '0xd4EA3b21C312D7C6a1c744927a6F80Fe226A8416', // Game Hub public key
    balanceA: web3.utils.toWei('0.1', 'ether'),
    balanceB: web3.utils.toWei('0.2', 'ether')
  }

  let entryID = agreementAlice.ID + agreementAlice.dbSalt

  await lAlice.createGSCAgreement(agreementAlice)

  let Alice_agreement = await lAlice.getGSCAgreement(entryID)
  //console.log(col)
  let Alice_tx = await lAlice.gsc.getTransactions(entryID)
  //console.log(Alice_tx)
  let AliceAgreementState = await lAlice.gsc.getStates('battleHub1337Alice')
  //Grab the latest (currently only state in list)
  AliceAgreementState = AliceAgreementState[0]
  //console.log(AliceAgreementState)

  console.log('Alice agreement created and stored.. initiating Ingrid')


  // --------------------------------------------------



  // Ingrid ------------------
  const proxyIngrid = new GunProxy(gun, 'layer2/Ingrid');
  let optionsIngrid = {
    db: proxyIngrid,
    privateKey: '0x9eb0e84b7cadfcbbec8d49ae7112b25e0c1cb158ecd2160c301afa1f4a1029c8'
  }

  let lIngrid = new Layer2lib('https://rinkeby.infura.io', optionsIngrid)
  lIngrid.initGSC()

  console.log('Ingrid initialized, receive agreement from Alice and joins')

  let agreementIngrid = JSON.parse(JSON.stringify(agreementAlice))
  agreementIngrid.dbSalt = 'Ingrid'

  await lIngrid.joinGSCAgreement(agreementIngrid, AliceAgreementState)

  let Ingrid_agreement = await lIngrid.getGSCAgreement('battleHub1337Ingrid')
  //console.log(Ingrid_agreement)
  let Ingrid_tx = await lIngrid.gsc.getTransactions('battleHub1337Ingrid')
  //console.log(Ingrid_tx)
  let IngridAgreementState = await lIngrid.gsc.getStates('battleHub1337Ingrid')
  //console.log(IngridAgreementState)

  console.log('Ingrid now sends openchannel ack to Alice')

  let isOpenAlice = await lAlice.gsc.isAgreementOpen('battleHub1337Alice')
  console.log('Alice state is agreement open: ' + isOpenAlice)
  let isOpenIngrid = await lIngrid.gsc.isAgreementOpen('battleHub1337Ingrid')
  console.log('Ingrid state is agreement open: ' + isOpenIngrid)

  // Load Bob's ack into Alice db
  agreementIngrid.dbSalt = 'Alice'
  await lAlice.gsc.updateAgreement(agreementIngrid)
  agreementIngrid.dbSalt = 'Ingrid'

  isOpenAlice = await lAlice.gsc.isAgreementOpen('battleHub1337Alice')
  console.log('Alice state is agreement open: ' + isOpenAlice)


  // Initiate Bob

  // BOB -----------------------
  const proxyBob = new GunProxy(gun, 'layer2/bob');
  let optionsBob = {
    db: proxyBob,
    privateKey: '0xaee55c1744171b2d3fedbbc885a615b190d3dd7e79d56e520a917a95f8a26579'
  }

  let lBob = new Layer2lib("https://rinkeby.infura.io", optionsBob)

  web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'))

  lBob.initGSC()

  let agreementBob = {
    dbSalt: 'Bob', // for testing multiple layer2 instances on same db
    ID: 'battleHub420',
    types: ['Battle-Ether'],
    partyA: '0x4c88305c5f9e4feb390e6ba73aaef4c64284b7bc', // Viewer or performer public key
    partyB: '0xd4EA3b21C312D7C6a1c744927a6F80Fe226A8416', // Spank Hub public key
    balanceA: web3.utils.toWei('0.1', 'ether'),
    balanceB: web3.utils.toWei('0.2', 'ether')
  }

  let entryID_b = agreementBob.ID + agreementBob.dbSalt

  await lBob.createGSCAgreement(agreementBob)

  let Bob_agreement = await lBob.getGSCAgreement(entryID_b)
  //console.log(col)
  let Bob_tx = await lBob.gsc.getTransactions(entryID_b)
  //console.log(Alice_tx)
  let BobAgreementState = await lBob.gsc.getStates('battleHub420Bob')
  //Grab the latest (currently only state in list)
  BobAgreementState = BobAgreementState[0]
  //console.log(AliceAgreementState)

  console.log('Bob agreement created and stored.. initiating with Ingrid')

  // Ingrid Join Bob---------------------

  let agreementIngrid_b = JSON.parse(JSON.stringify(agreementBob))
  agreementIngrid_b.dbSalt = 'Ingrid'

  await lIngrid.joinGSCAgreement(agreementIngrid_b, BobAgreementState)

  Ingrid_agreement = await lIngrid.getGSCAgreement('battleHub420Ingrid')
  //console.log(Ingrid_agreement)
  Ingrid_tx = await lIngrid.gsc.getTransactions('battleHub420Ingrid')
  //console.log(Ingrid_tx)
  IngridAgreementState = await lIngrid.gsc.getStates('battleHub420Ingrid')
  //console.log(IngridAgreementState)

  console.log('Ingrid now sends openchannel ack to Bob')

  let isOpenBob = await lBob.gsc.isAgreementOpen('battleHub420Bob')
  console.log('Bob state is agreement open: ' + isOpenBob)
  isOpenIngrid = await lIngrid.gsc.isAgreementOpen('battleHub420Ingrid')
  console.log('Ingrid state is agreement open: ' + isOpenIngrid)

  // Load Ingrids's ack into Bobs db
  Ingrid_agreement.dbSalt = 'Bob'
  await lBob.gsc.updateAgreement(Ingrid_agreement)
  Ingrid_agreement.dbSalt = 'Ingrid'

  isOpenBob = await lBob.gsc.isAgreementOpen('battleHub420Bob')
  console.log('Bob state is agreement open: ' + isOpenBob)

  // --------------------------------------------------


  // Open a virtual channel

  let channelAlice = {
    dbSalt: 'Alice', // for testing multiple layer2 instances on same db
    ID: 'respek',
    agreementID: 'battleHub1337',
    type: 'battleEther',
    counterparty: '0x4c88305c5f9e4feb390e6ba73aaef4c64284b7bc',
    balanceA: web3.utils.toWei('0.03', 'ether'),
    balanceB: web3.utils.toWei('0.05', 'ether'),
    bond: web3.utils.toWei('0.03', 'ether')
  }

  await lAlice.openGSCChannel(channelAlice)


  let Alice_chan = await lAlice.gsc.getChannel('respekAlice')
  //console.log(Alice_chan)
  Alice_agreement = await lAlice.getGSCAgreement('battleHub1337Alice')
  //console.log(Alice_agreement)
  let AliceChanState = await lAlice.gsc.getStates('respekAlice')
  //console.log(AliceChanState)
  AliceAgreementState = await lAlice.gsc.getStates('battleHub1337Alice')
  //console.log(AliceAgreementState)

  console.log('Alice sends her agreement with ingrid to ingrid and bob')

  console.log('Bob generating same agreement with ingrid')

  let channelBob = {
    dbSalt: 'Bob', // for testing multiple layer2 instances on same db
    ID: 'respek',
    agreementID: 'battleHub420',
    type: 'battleEther',
    counterparty: '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe',
    balanceA: web3.utils.toWei('0.03', 'ether'),
    balanceB: web3.utils.toWei('0.05', 'ether'),
    bond: web3.utils.toWei('0.05', 'ether')
  }


  await lBob.openGSCChannel(channelBob)


  let Bob_chan = await lBob.gsc.getChannel('respekBob')
  //console.log(Bob_chan)
  Bob_agreement = await lBob.getGSCAgreement('battleHub420Bob')
  //console.log(Bob_agreement)
  let BobChanState = await lBob.gsc.getStates('respekBob')
  //console.log(BobChanState)
  BobAgreementState = await lBob.gsc.getStates('battleHub420Bob')
  //console.log(BobAgreementState)

  console.log('Ingrid receives update agreement states from both alice and bob')


  // Ingrid calls join channel on Alice-------------

  let chanIngrid = JSON.parse(JSON.stringify(Alice_chan))
  chanIngrid.dbSalt = 'Ingrid-a'
  Ingrid_agreement = JSON.parse(JSON.stringify(Alice_agreement))
  Ingrid_agreement.dbSalt = 'Ingrid-a'
  await lIngrid.gsc.joinChannel(chanIngrid, Ingrid_agreement, chanIngrid.stateRaw)

  let Ingrid_chan_1 = await lIngrid.gsc.getChannel('respekIngrid-a')
  //console.log(Ingrid_chan)
  let Ingrid_agreement_1 = await lIngrid.getGSCAgreement('battleHub1337Ingrid')
  //console.log(Bob_agreement)
  let IngridChanState_1 = await lIngrid.gsc.getStates('respekIngrid-a')
  //console.log(BobChanState)
  let IngridAgreementState_1 = await lIngrid.gsc.getStates('battleHub1337Ingrid')
  //console.log(BobAgreementState)

  let txs_agreement = await lAlice.gsc.getTransactions('battleHub1337Alice')
  let txs_channel = await lAlice.gsc.getTransactions('respekIngrid-a')
  //console.log(txs_agreement)
  //console.log(txs_channel)

  console.log('Ingrid sends join channel ack to Alice')

  await lAlice.gsc.updateAgreement(Ingrid_agreement_1)


  // Ingrid calls join channel on Bob-------------

  let chanIngrid_2 = JSON.parse(JSON.stringify(Bob_chan))
  chanIngrid_2.dbSalt = 'Ingrid-b'
  let Ingrid_agreement_2 = JSON.parse(JSON.stringify(Bob_agreement))
  Ingrid_agreement_2.dbSalt = 'Ingrid-b'
  await lIngrid.gsc.joinChannel(chanIngrid_2, Ingrid_agreement_2, chanIngrid_2.stateRaw)

  let Ingrid_chan_2 = await lIngrid.gsc.getChannel('respekIngrid-b')
  //console.log(Ingrid_chan)
  Ingrid_agreement_2 = await lIngrid.getGSCAgreement('battleHub420Ingrid')
  //console.log(Bob_agreement)
  let IngridChanState_2 = await lIngrid.gsc.getStates('respekIngrid-b')
  //console.log(BobChanState)
  let IngridAgreementState_2 = await lIngrid.gsc.getStates('battleHub420Ingrid')
  //console.log(BobAgreementState)

  let txs_agreement_2 = await lIngrid.gsc.getTransactions('battleHub420Ingrid')
  let txs_channel_2 = await lIngrid.gsc.getTransactions('respekIngrid-b')
  //console.log(txs_agreement)
  //console.log(txs_channel)

  console.log('Ingrid sends join channel ack to Bob')

  await lBob.gsc.updateAgreement(Ingrid_agreement_2)

  console.log('Virtual Channel ready for updates')

  console.log('Negotiate the random half before creating update state on VC')

  // // --------------------------------------------------

  // TODO: Get Bob's random half and calculate the damage done

  let Alice_rands = new rand('test', 100)
  let Bob_rands = new rand('test2', 100)

  // Get user attack index
  let dmg = attackTable[2]

  let random = new mergeRand(Alice_rands.hashes[Alice_rands.hashes.length-1], Bob_rands.hashes[Bob_rands.hashes.length-1])
  console.log('RANDOM NUMBER = '+ random.getCurrentRandom())

  let dmgModifier = (1/100) * (random.getCurrentRandom()%100)
  console.log('DMG Modifier: '+dmgModifier)

  let newDmg = Math.floor(dmg-(dmg*dmgModifier))
  console.log('New DMG: '+newDmg)

  let partyBHealth = 100 - newDmg

  //console.log(Alice_rands)
  //console.log(Bob_rands)

  let updateState = {
    isClose: 0,
    nonce: 1,
    dbSalt: 'Alice', // for testing multiple layer2 instances on same db
    agreementID: 'battleHub420',
    channelID: 'respek',
    type: 'battleEther',
    partyA: '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe',
    partyB: '0x4c88305c5f9e4feb390e6ba73aaef4c64284b7bc',
    balanceA: web3.utils.toWei('0.03', 'ether'),
    balanceB: web3.utils.toWei('0.05', 'ether'),
    hpA: 100,
    hpB: partyBHealth,
    attack: 2,
    ultimateNonceA: 1,
    ultimateNonceB: 0,
    turn: '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe',
    randomA: Alice_rands.hashes[Alice_rands.hashes.length-1],
    randomB: Bob_rands.hashes[Bob_rands.hashes.length-1]
  }

  // // Send VC update state

  await lAlice.gsc.initiateUpdateVCstate('respekAlice', updateState, false)

  let Alice_Virtuals = await lAlice.gsc.getVirtuals('respekAlice')
  console.log(Alice_Virtuals)

  let Alice_Vstate = await lAlice.gsc.getStates('respekAliceV')
  //console.log(Alice_Vstate)

  Alice_Virtuals.dbSalt = 'Bob'
  await lAlice.gsc.confirmVCUpdate(Alice_Virtuals, updateState)
  Alice_Virtuals.dbSalt = 'Alice'

  // Get user attack index
  dmg = attackTable[1]

  random = new mergeRand(Alice_rands.hashes[Alice_rands.hashes.length-2], Bob_rands.hashes[Bob_rands.hashes.length-2])
  console.log('RANDOM NUMBER = '+ random.getCurrentRandom())

  dmgModifier = (1/100) * (random.getCurrentRandom()%100)
  console.log('DMG Modifier: '+dmgModifier)

  newDmg = Math.floor(dmg-(dmg*dmgModifier))
  console.log('New DMG: '+newDmg)

  let partyAHealth = 100 - newDmg

  let updateState2 = {
    isClose: 0,
    nonce: 2,
    dbSalt: 'Bob', // for testing multiple layer2 instances on same db
    agreementID: 'battleHub1337',
    channelID: 'respek',
    type: 'battleEther',
    partyA: '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe',
    partyB: '0x4c88305c5f9e4feb390e6ba73aaef4c64284b7bc',
    balanceA: web3.utils.toWei('0.03', 'ether'),
    balanceB: web3.utils.toWei('0.05', 'ether'),
    hpA: partyAHealth,
    hpB: partyBHealth,
    attack: 1,
    ultimateNonceA: 1,
    ultimateNonceB: 0,
    turn: '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe',
    randomA: Alice_rands.hashes[Alice_rands.hashes.length-2],
    randomB: Bob_rands.hashes[Bob_rands.hashes.length-2]
  }

  await lBob.gsc.initiateUpdateVCstate('respekBob', updateState2, false)

  let Bob_Virtuals = await lBob.gsc.getVirtuals('respekBob')
  console.log(Bob_Virtuals)

  // Generate a state that pushed HP of a party to 0
  // Signal this as a close state
  // Get both parties sigs
  // Send to Ingrid
  // Have Ingrid call update channel state on channelAlice with the adjusted wager winnings

  // assume Alice wins
  // Ingrid constructs update channel to adjust bobs balance ledger, this
  updateState = {
    isClose: 1,
    balanceA: web3.utils.toWei('0.08', 'ether'),
    balanceB: web3.utils.toWei('0', 'ether'),
    bond: web3.utils.toWei('0', 'ether')
  }
  Ingrid_agreement = await lIngrid.getGSCAgreement('battleHub420Ingrid')
  //console.log(Ingrid_agreement)
  await lIngrid.gsc.initiateUpdateChannelState('respekIngrid-b', updateState, false)

  Ingrid_chan_2 = await lIngrid.gsc.getChannel('respekIngrid-b')
  console.log(Ingrid_chan_2)

  // TODO fix db keys
  // build proper handling of updage state with close flag

  // Bob_chan = await lBob.gsc.getChannel('respekBob')
  // //console.log(Bob_chan)
  // Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  // //console.log(Bob_agreement)
  // BobChanState = await lBob.gsc.getStates('respekBob')
  // //console.log(BobChanState)
  // BobAgreementState = await lBob.gsc.getStates('spankHub1337Bob')
  // //console.log(BobAgreementState)

  // console.log('Bob sends channel state update to Alice')

  // let chanAlice = JSON.parse(JSON.stringify(Bob_chan))
  // let agreeAlice = JSON.parse(JSON.stringify(Bob_agreement))
  // //console.log(agreeAlice)
  // chanAlice.dbSalt = 'Alice'
  // agreeAlice.dbSalt = 'Alice'

  // await lAlice.gsc.confirmUpdateChannelState(chanAlice, agreeAlice, updateState)

  // Alice_chan = await lAlice.gsc.getChannel('respekAlice')
  // //console.log(Alice_chan)
  // Alice_agreement = await lAlice.getGSCAgreement('spankHub1337Alice')
  // //console.log(Alice_agreement)
  // // console.log(Alice_agreement.stateSignatures)
  // AliceChanState = await lAlice.gsc.getStates('respekAlice')
  // //console.log(AliceChanState)
  // AliceAgreementState = await lAlice.gsc.getStates('spankHub1337Alice')
  // //console.log(AliceAgreementState)

  // console.log('Alice confirmed channel state update, sends ack to Bob')

  // Alice_agreement.dbSalt = 'Bob'
  // await lBob.gsc.updateAgreement(Alice_agreement)
  // Alice_agreement.dbSalt = 'Alice'

  // txs_channel = await lBob.gsc.getTransactions('respekBob')
  // txs_agreement = await lBob.gsc.getTransactions('spankHub1337Bob')
  // Alice_tx = await lAlice.gsc.getTransactions('spankHub1337Alice')
  // let Alice_tx_chan = await lAlice.gsc.getTransactions('respekAlice')
  // //console.log(txs_agreement)


  // // --------------------------------------------------

  // // Send ether in channel and close channel

  // // Close Channel Consensus

  // // updateState = {
  // //   isClose: 1,
  // //   balanceA: web3.utils.toWei('0.07', 'ether'),
  // //   balanceB: web3.utils.toWei('0.01', 'ether')
  // // }
  // // Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  // // //console.log(Bob_agreement)
  // // await lBob.gsc.initiateUpdateChannelState('respekBob', updateState, false)
  // // Bob_chan = await lBob.gsc.getChannel('respekBob')
  // // Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  // // //console.log(Bob_agreement)
  // // agreeAlice = JSON.parse(JSON.stringify(Bob_agreement))
  // // chanAlice = JSON.parse(JSON.stringify(Bob_chan))
  // // chanAlice.dbSalt = 'Alice'
  // // agreeAlice.dbSalt = 'Alice'

  // // await lAlice.gsc.confirmUpdateChannelState(chanAlice, agreeAlice, updateState)

  // // let allAgreements = await lAlice.gsc.getAllAgreements()
  // // //console.log(allAgreements)

  // // let allChannels = await lAlice.gsc.getAllChannels()
  // // //console.log(allChannels)

  // // let alltxs = await lAlice.gsc.getAllTransactions()
  // // //console.log(alltxs)

  // // let allRawStates = await lAlice.gsc.getAllRawStates()
  // // //console.log(allRawStates)

  // // Alice_agreement = await lAlice.getGSCAgreement('spankHub1337Alice')

  // // Alice_agreement.dbSalt = 'Bob'
  // // await lBob.gsc.updateAgreement(Alice_agreement)
  // // Alice_agreement.dbSalt = 'Alice'

  // // // Close agreement
  // // await lAlice.gsc.initiateCloseAgreement('spankHub1337Alice')

  // // Alice_chan = await lAlice.gsc.getChannel('respekAlice')
  // // //console.log(Alice_chan)
  // // Alice_agreement = await lAlice.getGSCAgreement('spankHub1337Alice')
  // // //console.log(Alice_agreement)
  // // //console.log(Alice_agreement.stateSignatures)
  // // AliceChanState = await lAlice.gsc.getStates('respekAlice')
  // // //console.log(AliceChanState)
  // // AliceAgreementState = await lAlice.gsc.getStates('spankHub1337Alice')
  // // //console.log(AliceAgreementState)

  // // Alice_agreement.dbSalt = 'Bob'
  // // await lBob.gsc.confirmCloseAgreement(Alice_agreement, AliceAgreementState)
  // // Bob_chan = await lBob.gsc.getChannel('respekBob')
  // // //console.log(Bob_chan)
  // // Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  // // //console.log(Bob_agreement)
  // // BobChanState = await lBob.gsc.getStates('respekBob')
  // // //console.log(BobChanState)
  // // BobAgreementState = await lBob.gsc.getStates('spankHub1337Bob')
  // // //console.log(BobAgreementState)

  // // Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')

  // // Bob_agreement.dbSalt = 'Alice'
  // // await lAlice.gsc.updateAgreement(Bob_agreement)
  // // Bob_agreement.dbSalt = 'Bob'

  // // // Note: Either party may call this now to move final state
  // // await lBob.gsc.finalizeAgreement('spankHub1337Bob')


  // // Close Channel Byzantine

  // await lBob.gsc.startSettleChannel('respekBob')

  // console.log('Settlement period started on channel, calling close after')

  // await lBob.gsc.closeByzantineChannel('respekBob')

  console.log('Agreement finalized, quiting...')
}