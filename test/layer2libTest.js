'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')

const GunProxy = require('layer2storage').GunStorageProxy;
const Gun = require("gun");

const gun = new Gun()
test(gun);

let etherPaymentIntAddress = '0x'
let etherPaymentExtAddress = '0x'
let CTFregistryAddress = '0x'

async function test(gun) {
  // alice + bob keys from rinkeby
  const partyA = '0x1e8524370B7cAf8dC62E3eFfBcA04cCc8e493FfE'
  const partyAPrivate = '0x2c339e1afdbfd0b724a4793bf73ec3a4c235cceb131dcd60824a06cefbef9875'
  const partyB = '0x4c88305c5f9e4feb390e6ba73aaef4c64284b7bc'
  const partyBPrivate = '0xaee55c1744171b2d3fedbbc885a615b190d3dd7e79d56e520a917a95f8a26579'
  const aliceProxy = new GunProxy(gun, `layer2/${partyA}`);
  const bobProxy = new GunProxy(gun, `layer2/${partyB}`);

  // ALICE
  let optionsAlice = {
    db: aliceProxy,
    privateKey: partyAPrivate
  }

  let lAlice = new Layer2lib('https://rinkeby.infura.io', optionsAlice)

  web3.setProvider(new web3.providers.HttpProvider('https://rinkeby.infura.io'))

  try {
    const balA = await lAlice.getMainnetBalance(partyA)
    const balB = await lAlice.getMainnetBalance(partyB)
    console.log('alice starting balance:', balA)
    console.log('bob starting balance:', balB)
  } catch (e) {
    console.log(e)
  }

  lAlice.initGSC()

  // clear database
  await lAlice.gsc.clearStorage()

  let agreement = {
    ID: 'agreementId',
    types: ['Ether'],
    partyA, // Viewer or performer public key
    partyB, // Spank Hub public key
    balanceA: web3.utils.toWei('0.1', 'ether'),
    balanceB: web3.utils.toWei('0.2', 'ether')
  }

  await lAlice.createGSCAgreement(agreement)

  let Alice_agreement = await lAlice.getGSCAgreement('agreementId')
  //console.log(col)
  let Alice_tx = await lAlice.gsc.getTransactions('agreementId')
  //console.log(Alice_tx)
  let AliceAgreementState = await lAlice.gsc.getStates('agreementId')
  //Grab the latest (currently only state in list)
  AliceAgreementState = AliceAgreementState[0]
  //console.log(AliceAgreementState)

  console.log('Alice agreement created and stored.. initiating Bob')
  // --------------------------------------------------

  // BOB
  let optionsBob = {
    db: bobProxy,
    privateKey: partyBPrivate
  }

  let lBob = new Layer2lib('https://rinkeby.infura.io', optionsBob)
  lBob.initGSC()

  console.log('Bob initialized, receive agreement from Alice and joins')

  let bobAgreement = JSON.parse(JSON.stringify(agreement))

  await lBob.joinGSCAgreement(bobAgreement, AliceAgreementState)

  let Bob_agreement = await lBob.getGSCAgreement('agreementId')
  //console.log(Bob_agreement)
  let Bob_tx = await lBob.gsc.getTransactions('agreementId')
  //console.log(Bob_tx)
  let BobAgreementState = await lBob.gsc.getStates('agreementId')
  //console.log(BobAgreementState)

  console.log('Bob now sends openchannel ack to Alice')

  let isOpenAlice = await lAlice.gsc.isAgreementOpen('agreementId')
  console.log('Alice state is agreement open: ' + isOpenAlice)
  let isOpenBob = await lBob.gsc.isAgreementOpen('agreementId')
  console.log('Bob state is agreement open: ' + isOpenBob)
  // alice updates agreement with ack

  // Load Bob's ack into Alice db
  await lAlice.gsc.updateAgreement(bobAgreement)

  isOpenAlice = await lAlice.gsc.isAgreementOpen('agreementId')
  console.log('Alice state is agreement open: ' + isOpenAlice)



  // --------------------------------------------------


  // Open a channel

  let channel = {
    ID: 'channelId',
    agreementID: 'agreementId',
    type: 'ether',
    balanceA: web3.utils.toWei('0.03', 'ether'),
    balanceB: web3.utils.toWei('0.05', 'ether')
  }

  await lAlice.openGSCChannel(channel)


  let Alice_chan = await lAlice.gsc.getChannel('channelId')
  //console.log(Alice_chan)
  Alice_agreement = await lAlice.getGSCAgreement('agreementId')
  //console.log(Alice_agreement)
  let AliceChanState = await lAlice.gsc.getStates('channelId')
  //console.log(AliceChanState)
  AliceAgreementState = await lAlice.gsc.getStates('agreementId')
  //console.log(AliceAgreementState)

  let chanBob = JSON.parse(JSON.stringify(Alice_chan))
  Bob_agreement = JSON.parse(JSON.stringify(Alice_agreement))
  await lBob.gsc.joinChannel(chanBob, Bob_agreement, chanBob.stateRaw)

  let Bob_chan = await lBob.gsc.getChannel('channelId')
  //console.log(Bob_chan)
  Bob_agreement = await lBob.getGSCAgreement('agreementId')
  //console.log(Bob_agreement)
  let BobChanState = await lBob.gsc.getStates('channelId')
  //console.log(BobChanState)
  BobAgreementState = await lBob.gsc.getStates('agreementId')
  //console.log(BobAgreementState)

  let txs_agreement = await lBob.gsc.getTransactions('agreementId')
  let txs_channel = await lBob.gsc.getTransactions('channelId')
  //console.log(txs_agreement)
  //console.log(txs_channel)

  console.log('Bob sends join channel ack to Alice')
  await lAlice.gsc.updateAgreement(Bob_agreement)


  // --------------------------------------------------

  // Send ether in channel



  Alice_agreement = await lAlice.getGSCAgreement('agreementId')
  //console.log(Alice_agreement)

  console.log('ether channel now open')
  console.log('Bob is initiating ether payment')

  let updateState = {
    isClose: 0,
    balanceA: web3.utils.toWei('0.06', 'ether'),
    balanceB: web3.utils.toWei('0.02', 'ether')
  }

  await lBob.gsc.initiateUpdateChannelState('channelId', updateState, false)

  Bob_chan = await lBob.gsc.getChannel('channelId')
  //console.log(Bob_chan)
  Bob_agreement = await lBob.getGSCAgreement('agreementId')
  //console.log(Bob_agreement)
  BobChanState = await lBob.gsc.getStates('channelId')
  //console.log(BobChanState)
  BobAgreementState = await lBob.gsc.getStates('agreementId')
  //console.log(BobAgreementState)

  console.log('Bob sends channel state update to Alice')

  let chanAlice = JSON.parse(JSON.stringify(Bob_chan))
  let agreeAlice = JSON.parse(JSON.stringify(Bob_agreement))
  //console.log(agreeAlice)


  await lAlice.gsc.confirmUpdateChannelState(chanAlice, agreeAlice, updateState)

  Alice_chan = await lAlice.gsc.getChannel('channelId')
  //console.log(Alice_chan)
  Alice_agreement = await lAlice.getGSCAgreement('agreementId')
  //console.log(Alice_agreement)
  // console.log(Alice_agreement.stateSignatures)
  AliceChanState = await lAlice.gsc.getStates('channelId')
  //console.log(AliceChanState)
  AliceAgreementState = await lAlice.gsc.getStates('agreementId')
  //console.log(AliceAgreementState)

  console.log('Alice confirmed channel state update, sends ack to Bob')

  await lBob.gsc.updateAgreement(Alice_agreement)

  txs_channel = await lBob.gsc.getTransactions('channelId')
  txs_agreement = await lBob.gsc.getTransactions('agreementId')
  Alice_tx = await lAlice.gsc.getTransactions('agreementId')
  let Alice_tx_chan = await lAlice.gsc.getTransactions('channelId')
  //console.log(txs_agreement)


  // --------------------------------------------------

  // Send ether in channel and close channel

  // Close Channel Consensus

  // updateState = {
  //   isClose: 1,
  //   balanceA: web3.utils.toWei(0.07, 'ether'),
  //   balanceB: web3.utils.toWei(0.01, 'ether')
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

  await lBob.gsc.startSettleChannel('channelId')

  console.log('Settlement period started on channel, calling close after')

  await lBob.gsc.closeByzantineChannel('channelId')

  console.log('Agreement finalized, quiting...')

  try {
    const balA = await lAlice.getMainnetBalance(partyA)
    const balB = await lAlice.getMainnetBalance(partyB)
    console.log('alice ending balance:', balA)
    console.log('bob ending balance:', balB)
  } catch (e) {
    console.log(e)
  }

}
