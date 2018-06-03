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
    privateKey: '0x7236c4adfa6773526620f0ab4e4d626a9875a43f56bb2221f223755e43a75ae9'
  }

  let lAlice = new Layer2lib("http://localhost:7545", optionsAlice)

  web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'))

  try {
    let account = '0x73307362a4d6d9158a3892a97318677c53b72ae4'
    let t = await lAlice.getMainnetBalance(account)
    console.log(t)
  } catch (e) {
    console.log(e)
  }

  lAlice.initGSC()

  // clear database
  await lAlice.gsc.clearStorage()

  let agreementAlice = {
    ID: 'agreementAlice',
    types: ['Ether'],
    partyA: '0x73307362a4d6d9158a3892a97318677c53b72ae4', // Viewer or performer public key
    partyB: '0x9c62a6bb961ade972d381376d3dbf093585c233b', // Spank Hub public key
    balanceA: web3.utils.toWei('0.1', 'ether'),
    balanceB: web3.utils.toWei('0.2', 'ether')
  }

  await lAlice.createGSCAgreement(agreementAlice)

  let Alice_agreement = await lAlice.getGSCAgreement('agreementAlice')
  //console.log(col)
  let Alice_tx = await lAlice.gsc.getTransactions('agreementAlice')
  //console.log(Alice_tx)
  let AliceAgreementState = await lAlice.gsc.getStates('agreementAlice')
  //Grab the latest (currently only state in list)
  AliceAgreementState = AliceAgreementState[0]
  //console.log(AliceAgreementState)

  console.log('Alice agreement created and stored.. initiating Bob')
  // --------------------------------------------------

  // BOB
  let optionsBob = {
    db: redisProxy,
    privateKey: '0x2378cd9ea07f78b9bc458b00019dc3799d4988794acf65d7ae127fc4e40326a4'
  }

  let lBob = new Layer2lib('http://localhost:7545', optionsBob)
  lBob.initGSC()

  console.log('Bob initialized, receive agreement from Alice and joins')

  let agreementBob = JSON.parse(JSON.stringify(agreementAlice))
  agreementBob.ID = 'agreementBob'
  await lBob.joinGSCAgreement(agreementBob, AliceAgreementState)

  let Bob_agreement = await lBob.getGSCAgreement('agreementBob')
  //console.log(Bob_agreement)
  let Bob_tx = await lBob.gsc.getTransactions('agreementBob')
  //console.log(Bob_tx)
  let BobAgreementState = await lBob.gsc.getStates('agreementBob')
  //console.log(BobAgreementState)

  console.log('Bob now sends openchannel ack to Alice')

  let isOpenAlice = await lAlice.gsc.isAgreementOpen('agreementAlice')
  console.log('Alice state is agreement open: ' + isOpenAlice)
  let isOpenBob = await lBob.gsc.isAgreementOpen('agreementBob')
  console.log('Bob state is agreement open: ' + isOpenBob)
  // alice updates agreement with ack
  agreementBob.ID = 'agreementAlice'
  await lAlice.gsc.updateAgreement(agreementBob)

  isOpenAlice = await lAlice.gsc.isAgreementOpen('agreementAlice')
  console.log('Alice state is agreement open: ' + isOpenAlice)



  // --------------------------------------------------


  // Open a channel

  let channelAlice = {
    ID: 'channelAlice',
    agreementID: 'agreementAlice',
    type: 'ether',
    balanceA: web3.utils.toWei('0.03', 'ether'),
    balanceB: web3.utils.toWei('0.05', 'ether')
  }

  await lAlice.openGSCChannel(channelAlice)


  let Alice_chan = await lAlice.gsc.getChannel('channelAlice')
  //console.log(Alice_chan)
  Alice_agreement = await lAlice.getGSCAgreement('agreementAlice')
  //console.log(Alice_agreement)
  let AliceChanState = await lAlice.gsc.getStates('channelAlice')
  //console.log(AliceChanState)
  AliceAgreementState = await lAlice.gsc.getStates('agreementAlice')
  //console.log(AliceAgreementState)

  let chanBob = JSON.parse(JSON.stringify(Alice_chan))
  chanBob.ID = 'channelBob'
  Bob_agreement = JSON.parse(JSON.stringify(Alice_agreement))
  Bob_agreement.ID = 'agreementBob'
  await lBob.gsc.joinChannel(chanBob, Bob_agreement, chanBob.stateRaw)

  let Bob_chan = await lBob.gsc.getChannel('channelBob')
  //console.log(Bob_chan)
  Bob_agreement = await lBob.getGSCAgreement('agreementBob')
  //console.log(Bob_agreement)
  let BobChanState = await lBob.gsc.getStates('channelBob')
  //console.log(BobChanState)
  BobAgreementState = await lBob.gsc.getStates('agreementBob')
  //console.log(BobAgreementState)

  let txs_agreement = await lBob.gsc.getTransactions('agreementBob')
  let txs_channel = await lBob.gsc.getTransactions('channelBob')
  //console.log(txs_agreement)
  //console.log(txs_channel)

  console.log('Bob sends join channel ack to Alice')
  Bob_agreement.ID = 'agreementAlice'
  await lAlice.gsc.updateAgreement(Bob_agreement)


  // --------------------------------------------------

  // Send ether in channel

  Bob_agreement.ID = 'agreementBob'

  Alice_agreement = await lAlice.getGSCAgreement('agreementAlice')
  //console.log(Alice_agreement)

  console.log('ether channel now open')
  console.log('Bob is initiating ether payment')

  let updateState = {
    isClose: 0,
    balanceA: web3.utils.toWei('0.06', 'ether'),
    balanceB: web3.utils.toWei('0.02', 'ether')
  }

  await lBob.gsc.initiateUpdateChannelState('channelBob', updateState, false)

  Bob_chan = await lBob.gsc.getChannel('channelBob')
  //console.log(Bob_chan)
  Bob_agreement = await lBob.getGSCAgreement('agreementBob')
  //console.log(Bob_agreement)
  BobChanState = await lBob.gsc.getStates('channelBob')
  //console.log(BobChanState)
  BobAgreementState = await lBob.gsc.getStates('agreementBob')
  //console.log(BobAgreementState)

  console.log('Bob sends channel state update to Alice')

  let chanAlice = JSON.parse(JSON.stringify(Bob_chan))
  let agreeAlice = JSON.parse(JSON.stringify(Bob_agreement))
  //console.log(agreeAlice)
  chanAlice.ID = 'channelAlice'
  agreeAlice.ID = 'agreementAlice'

  await lAlice.gsc.confirmUpdateChannelState(chanAlice, agreeAlice, updateState)

  Alice_chan = await lAlice.gsc.getChannel('channelAlice')
  //console.log(Alice_chan)
  Alice_agreement = await lAlice.getGSCAgreement('agreementAlice')
  //console.log(Alice_agreement)
  // console.log(Alice_agreement.stateSignatures)
  AliceChanState = await lAlice.gsc.getStates('channelAlice')
  //console.log(AliceChanState)
  AliceAgreementState = await lAlice.gsc.getStates('agreementAlice')
  //console.log(AliceAgreementState)

  console.log('Alice confirmed channel state update, sends ack to Bob')

  Alice_agreement.ID = 'agreementBob'
  await lBob.gsc.updateAgreement(Alice_agreement)
  Alice_agreement.ID = 'agreementAlice'

  txs_channel = await lBob.gsc.getTransactions('channelBob')
  txs_agreement = await lBob.gsc.getTransactions('agreementBob')
  Alice_tx = await lAlice.gsc.getTransactions('agreementAlice')
  let Alice_tx_chan = await lAlice.gsc.getTransactions('channelAlice')
  //console.log(txs_agreement)


  // --------------------------------------------------

  // Send ether in channel and close channel

  // Close Channel Consensus

  // updateState = {
  //   isClose: 1,
  //   balanceA: web3.utils.toWei('0.07', 'ether'),
  //   balanceB: web3.utils.toWei('0.01', 'ether')
  // }
  // Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  // //console.log(Bob_agreement)
  // await lBob.gsc.initiateUpdateChannelState('respekBob', updateState, false)
  // Bob_chan = await lBob.gsc.getChannel('respekBob')
  // Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  // //console.log(Bob_agreement)
  // agreeAlice = JSON.parse(JSON.stringify(Bob_agreement))
  // chanAlice = JSON.parse(JSON.stringify(Bob_chan))
  // chanAlice.dbSalt = 'Alice'
  // agreeAlice.dbSalt = 'Alice'

  // await lAlice.gsc.confirmUpdateChannelState(chanAlice, agreeAlice, updateState)

  // let allAgreements = await lAlice.gsc.getAllAgreements()
  // //console.log(allAgreements)

  // let allChannels = await lAlice.gsc.getAllChannels()
  // //console.log(allChannels)

  // let alltxs = await lAlice.gsc.getAllTransactions()
  // //console.log(alltxs)

  // let allRawStates = await lAlice.gsc.getAllRawStates()
  // //console.log(allRawStates)

  // Alice_agreement = await lAlice.getGSCAgreement('spankHub1337Alice')

  // Alice_agreement.dbSalt = 'Bob'
  // await lBob.gsc.updateAgreement(Alice_agreement)
  // Alice_agreement.dbSalt = 'Alice'

  // // Close agreement
  // await lAlice.gsc.initiateCloseAgreement('spankHub1337Alice')

  // Alice_chan = await lAlice.gsc.getChannel('respekAlice')
  // //console.log(Alice_chan)
  // Alice_agreement = await lAlice.getGSCAgreement('spankHub1337Alice')
  // //console.log(Alice_agreement)
  // //console.log(Alice_agreement.stateSignatures)
  // AliceChanState = await lAlice.gsc.getStates('respekAlice')
  // //console.log(AliceChanState)
  // AliceAgreementState = await lAlice.gsc.getStates('spankHub1337Alice')
  // //console.log(AliceAgreementState)

  // Alice_agreement.dbSalt = 'Bob'
  // await lBob.gsc.confirmCloseAgreement(Alice_agreement, AliceAgreementState)
  // Bob_chan = await lBob.gsc.getChannel('respekBob')
  // //console.log(Bob_chan)
  // Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')
  // //console.log(Bob_agreement)
  // BobChanState = await lBob.gsc.getStates('respekBob')
  // //console.log(BobChanState)
  // BobAgreementState = await lBob.gsc.getStates('spankHub1337Bob')
  // //console.log(BobAgreementState)

  // Bob_agreement = await lBob.getGSCAgreement('spankHub1337Bob')

  // Bob_agreement.dbSalt = 'Alice'
  // await lAlice.gsc.updateAgreement(Bob_agreement)
  // Bob_agreement.dbSalt = 'Bob'

  // // Note: Either party may call this now to move final state
  // await lBob.gsc.finalizeAgreement('spankHub1337Bob')


  // Close Channel Byzantine

  await lBob.gsc.startSettleChannel('channelBob')

  console.log('Settlement period started on channel, calling close after')

  await lBob.gsc.closeByzantineChannel('channelBob')

  console.log('Agreement finalized, quiting...')
  redisClient.quit()
}
