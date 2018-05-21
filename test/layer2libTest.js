'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')
const Promise = require('bluebird');

const redisFake = require("fakeredis");
const redis = require("redis");

// connect to Redis locally otherwise use fakeredis
var redisClient = redis.createClient();
redisClient.on('error', err => {
  if (err.code !== 'ECONNREFUSED') return;
  redisClient.quit();
  console.warn('!!! Redis connection failed, defaulting to fakeredis');
  test(redisFake.createClient());
});
redisClient.on('connect', () => test(redisClient));

let etherPaymentIntAddress = '0x'
let etherPaymentExtAddress = '0x'
let CTFregistryAddress = '0x'

async function test(redisClient) {
  const redis = Promise.promisifyAll(redisClient);
  const redisProxy = new Layer2lib.RedisStorageProxy(redis);

  // ALICE
  let optionsAlice = {
    db: redisProxy,
    privateKey: '0x2c339e1afdbfd0b724a4793bf73ec3a4c235cceb131dcd60824a06cefbef9875'
  }

  let lAlice = new Layer2lib("http://localhost:8545", optionsAlice)

  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

  try {
    let account = '0xa84135fdbd790a6feeffd204b14a103bb2e41e92'
    let t = await lAlice.getMainnetBalance(account)
    console.log(t)
  } catch (e) {
    console.log(e)
  }

  lAlice.initGSC()

  // clear database
  await lAlice.gsc.clearStorage()

  let agreementAlice = {
    dbSalt: 'Alice', // for testing multiple layer2 instances on same db
    ID: 'spankHub1337',
    types: ['Ether'],
    partyA: web3.eth.accounts[0], // Viewer or performer public key
    partyB: web3.eth.accounts[1], // Spank Hub public key
    balanceA: web3.toWei(0.1, 'ether'),
    balanceB: web3.toWei(0.2, 'ether')
  }

  let entryID = agreementAlice.ID + agreementAlice.dbSalt

  await lAlice.createGSCAgreement(agreementAlice)

  let Alice_agreement = await lAlice.getGSCAgreement(entryID)
  //console.log(col)
  let Alice_tx = await lAlice.gsc.getTransactions(entryID)
  //console.log(Alice_tx)
  let AliceAgreementState = await lAlice.gsc.getStates('spankHub1337Alice')
  //Grab the latest (currently only state in list)
  AliceAgreementState = AliceAgreementState[0]
  //console.log(AliceAgreementState)

  console.log('Alice agreement created and stored.. initiating Bob')





  // --------------------------------------------------
  // BOB
  let optionsBob = {
    db: client,
    privateKey: '0xaee55c1744171b2d3fedbbc885a615b190d3dd7e79d56e520a917a95f8a26579'
  }

  let lBob = new Layer2lib('http://localhost:8545', optionsBob)
  lBob.initGSC()

  console.log('Bob initialized, receive agreement from Alice and joins')

  let agreementBob = JSON.parse(JSON.stringify(agreementAlice))
  agreementBob.dbSalt = 'Bob'

  await lBob.joinGSCAgreement(agreementBob, AliceAgreementState)

  let Bob_agreement = await lAlice.getGSCAgreement('spankHub1337Bob')
  //console.log(Bob_agreement)
  let Bob_tx = await lBob.gsc.getTransactions('spankHub1337Bob')
  //console.log(Bob_tx)
  let BobAgreementState = await lBob.gsc.getStates('spankHub1337Bob')
  //console.log(BobAgreementState)

  console.log('Bob now sends openchannel ack to Alice')

  let isOpenAlice = await lAlice.gsc.isAgreementOpen('spankHub1337Alice')
  console.log('Alice state is agreement open: ' + isOpenAlice)
  let isOpenBob = await lBob.gsc.isAgreementOpen('spankHub1337Bob')
  console.log('Bob state is agreement open: ' + isOpenBob)

  // Load Bob's ack into Alice db
  agreementBob.dbSalt = 'Alice'
  await lAlice.gsc.updateAgreement(agreementBob)
  agreementBob.dbSalt = 'Bob'

  isOpenAlice = await lAlice.gsc.isAgreementOpen('spankHub1337Alice')
  console.log('Alice state is agreement open: ' + isOpenAlice)

  //---------------------------
  // Open a channel

  let channelAlice = {
    dbSalt: 'Alice', // for testing multiple layer2 instances on same db
    ID: 'respek',
    agreementID: 'spankHub1337',
    type: 'ether',
    balanceA: web3.toWei(0.03, 'ether'),
    balanceB: web3.toWei(0.05, 'ether')
  }

  await lAlice.openGSCChannel(channelAlice)


  let Alice_chan = await lAlice.gsc.getChannel('respekAlice')
  //console.log(Alice_chan)
  Alice_agreement = await lAlice.getGSCAgreement('spankHub1337Alice')
  //console.log(Alice_agreement)
  let AliceChanState = await lAlice.gsc.getStates('respekAlice')
  //console.log(AliceChanState)
  AliceAgreementState = await lAlice.gsc.getStates('spankHub1337Alice')
  //console.log(AliceAgreementState)

  let chanBob = JSON.parse(JSON.stringify(Alice_chan))
  chanBob.dbSalt = 'Bob'
  Bob_agreement = JSON.parse(JSON.stringify(Alice_agreement))
  Bob_agreement.dbSalt = 'Bob'
  await lBob.gsc.joinChannel(chanBob, Bob_agreement, chanBob.stateRaw)

  let Bob_chan = await lBob.gsc.getChannel('respekBob')
  //console.log(Bob_chan)
  Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  //console.log(Bob_agreement)
  let BobChanState = await lBob.gsc.getStates('respekBob')
  //console.log(BobChanState)
  BobAgreementState = await lBob.gsc.getStates('spankHub1337Bob')
  //console.log(BobAgreementState)

  let txs_agreement = await lBob.gsc.getTransactions('spankHub1337Bob')
  let txs_channel = await lBob.gsc.getTransactions('respekBob')
  //console.log(txs_agreement)
  //console.log(txs_channel)

  console.log('Bob sends join channel ack to Alice')
  Bob_agreement.dbSalt = 'Alice'
  await lAlice.gsc.updateAgreement(Bob_agreement)
  Bob_agreement.dbSalt = 'Bob'

  Alice_agreement = await lAlice.getGSCAgreement('spankHub1337Alice')
  //console.log(Alice_agreement)

  console.log('ether channel now open')
  console.log('Bob is initiating ether payment')

  let updateState = {
    isClose: 0,
    balanceA: web3.toWei(0.06, 'ether'),
    balanceB: web3.toWei(0.02, 'ether')
  }

  await lBob.gsc.initiateUpdateChannelState('respekBob', updateState, false)

  Bob_chan = await lBob.gsc.getChannel('respekBob')
  //console.log(Bob_chan)
  Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  //console.log(Bob_agreement)
  BobChanState = await lBob.gsc.getStates('respekBob')
  //console.log(BobChanState)
  BobAgreementState = await lBob.gsc.getStates('spankHub1337Bob')
  //console.log(BobAgreementState)

  console.log('Bob sends channel state update to Alice')

  let chanAlice = JSON.parse(JSON.stringify(Bob_chan))
  let agreeAlice = JSON.parse(JSON.stringify(Bob_agreement))
  chanAlice.dbSalt = 'Alice'
  agreeAlice.dbSalt = 'Alice'

  await lAlice.gsc.confirmUpdateChannelState(chanAlice, agreeAlice, updateState)

  Alice_chan = await lAlice.gsc.getChannel('respekAlice')
  //console.log(Alice_chan)
  Alice_agreement = await lAlice.getGSCAgreement('spankHub1337Alice')
  // console.log(Alice_agreement)
  // console.log(Alice_agreement.stateSignatures)
  AliceChanState = await lAlice.gsc.getStates('respekAlice')
  //console.log(AliceChanState)
  AliceAgreementState = await lAlice.gsc.getStates('spankHub1337Alice')
  //console.log(AliceAgreementState)

  console.log('Alice confirmed channel state update, sends ack to Bob')

  await lBob.gsc.updateAgreement(Alice_agreement)

  txs_channel = await lBob.gsc.getTransactions('respekBob')
  txs_agreement = await lBob.gsc.getTransactions('spankHub1337Bob')
  Alice_tx = await lAlice.gsc.getTransactions('spankHub1337Alice')
  let Alice_tx_chan = await lAlice.gsc.getTransactions('respekAlice')
  console.log(txs_agreement)

  // Close Channel
  updateState = {
    isClose: 1,
    balanceA: web3.toWei(0.07, 'ether'),
    balanceB: web3.toWei(0.01, 'ether')
  }

  await lBob.gsc.initiateUpdateChannelState('respekBob', updateState, false)
  Bob_chan = await lBob.gsc.getChannel('respekBob')
  Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  agreeAlice = JSON.parse(JSON.stringify(Bob_agreement))
  chanAlice = JSON.parse(JSON.stringify(Bob_chan))
  chanAlice.dbSalt = 'Alice'
  agreeAlice.dbSalt = 'Alice'

  await lAlice.gsc.confirmUpdateChannelState(chanAlice, agreeAlice, updateState)

  let allAgreements = await lAlice.gsc.getAllAgreements()
  //console.log(allAgreements)

  let allChannels = await lAlice.gsc.getAllChannels()
  //console.log(allChannels)

  let alltxs = await lAlice.gsc.getAllTransactions()
  //console.log(alltxs)

  let allRawStates = await lAlice.gsc.getAllRawStates()
  //console.log(allRawStates)

  // Close agreement
  await lAlice.gsc.initiateCloseAgreement('spankHub1337Alice')

  Alice_chan = await lAlice.gsc.getChannel('respekAlice')
  //console.log(Alice_chan)
  Alice_agreement = await lAlice.getGSCAgreement('spankHub1337Alice')
  console.log(Alice_agreement)
  //console.log(Alice_agreement.stateSignatures)
  AliceChanState = await lAlice.gsc.getStates('respekAlice')
  //console.log(AliceChanState)
  AliceAgreementState = await lAlice.gsc.getStates('spankHub1337Alice')
  //console.log(AliceAgreementState)

  Alice_agreement.dbSalt = 'Bob'
  await lBob.gsc.confirmCloseAgreement(Alice_agreement, AliceAgreementState)
  Bob_chan = await lBob.gsc.getChannel('respekBob')
  //console.log(Bob_chan)
  Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  console.log(Bob_agreement)
  BobChanState = await lBob.gsc.getStates('respekBob')
  //console.log(BobChanState)
  BobAgreementState = await lBob.gsc.getStates('spankHub1337Bob')
  //console.log(BobAgreementState)

  // Note: Either party may call this now to move final state
  await lBob.gcs.finalizeAgreement('spankHub1337Bob')
  client.quit()
}