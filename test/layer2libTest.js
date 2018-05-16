'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')
const Promise = require('bluebird');

//const redis = require("fakeredis");
const redis = require("redis");
const client = Promise.promisifyAll(redis.createClient())

let etherPaymentIntAddress = '0x'
let etherPaymentExtAddress = '0x'
let CTFregistryAddress = '0x'

async function test() {

  // ALICE
  let optionsAlice = {
    db: client,
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
    dbSalt: 'Alice',
    ID: 'spankHub1337',
    types: ['Ether'],
    partyA: web3.eth.accounts[0], // Viewer or performer public key
    partyB: web3.eth.accounts[1], // Spank Hub public key
    balanceA: web3.toWei(0.1, 'ether'),
    balanceB: web3.toWei(0.2, 'ether')
  }

  let entryID = agreementAlice.ID+agreementAlice.dbSalt

  await lAlice.createGSCAgreement(agreementAlice)

  let Alice_agreement = await lAlice.getGSCAgreement(entryID)
  //console.log(col)
  let Alice_tx = await lAlice.gsc.getTransactions(entryID)
  //console.log(Alice_tx)
  let AliceAgreementState = await lAlice.gsc.getStates('spankHub1337Alice')
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
    dbSalt: 'Alice',
    ID: 'respek',
    agreementID: 'spankHub1337',
    type: 'ether',
    balanceA: web3.toWei(0.05, 'ether'),
    balanceB: web3.toWei(0.1, 'ether')
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

  // let chanBob = JSON.parse(JSON.stringify(chan))
  // chanBob.dbSalt = 'Bob'
  // let col2 = JSON.parse(JSON.stringify(col))
  // col2.dbSalt = 'Bob'
  // await lBob.gsc.joinChannel(chanBob, col2)

  // console.log('ether channel now open')

  // chan = await lBob.gsc.getChannel('respekBob')

  // console.log(chan)
  // col = await lBob.getGSCAgreement('spankHub1337Bob')
  // console.log(col)

  // console.log('Bob now sends ack to Alice of open etherchannel')

  // console.log('Bob is initiating ether payment')

  // let updateState = {
  //   balanceA: web3.toWei(0.06, 'ether'),
  //   balanceB: web3.toWei(0.09, 'ether')
  // }

  // await lBob.gsc.updateChannelState('respekBob', updateState)

  client.quit()
}

test()