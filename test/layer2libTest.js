'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')
const Promise = require('bluebird');

const redis = require("fakeredis");
//const redis = require("redis");
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


  let agreement = {
    ID: 'spankHub1337',
    types: ['Ether'],
    partyA: web3.eth.accounts[0], // Viewer or performer public key
    partyB: web3.eth.accounts[1], // Spank Hub public key
    balanceA: web3.toWei(0.1, 'ether'),
    balanceB: web3.toWei(0.2, 'ether')
  }

  await lAlice.createGSCAgreement(agreement)

  // let col = await lAlice.getGSCAgreement('spankHub1337')
  // console.log(col)

  // agreement = {
  //   ID: 'Bob4206969',
  //   partyA: web3.eth.accounts[0], // Viewer or performer public key
  //   partyB: web3.eth.accounts[1], // Spank Hub public key
  //   balanceA: web3.toWei(0.1, 'ether'),
  //   balanceB: web3.toWei(0.2, 'ether'),
  //   openPending: true,
  //   inDispute: false,
  //   stateRaw: [],
  //   stateSerialized: '0x',
  //   signatures: [],
  //   subChannels: {}
  // }

  let col = await lAlice.getGSCAgreement('spankHub1337')
  console.log(col)

  // col = await l.getGSCAgreement('Bob4206969')
  // console.log(col)
  console.log('Alice agreement created and stored.. initiating Bob')

  // --------------------------------------------------
  // BOB
  let optionsBob = {
    db: client,
    privateKey: '0xaee55c1744171b2d3fedbbc885a615b190d3dd7e79d56e520a917a95f8a26579'
  }

  let lBob = new Layer2lib('http://localhost:8545', optionsBob)

  try {
    let account = '0x4C88305C5F9E4feB390e6bA73AAEF4c64284b7bC'
    let t = await lBob.getMainnetBalance(account)
    console.log(t)
  } catch (e) {
    console.log(e)
  }

  lBob.initGSC()

  console.log('Bob initialized, receive agreement from Alice and joins')

  let agreement2 = JSON.parse(JSON.stringify(agreement))
  await lBob.joinGSCAgreement(agreement2)
  // console.log(lBob.db)
  // console.log(lAlice.db)

  col = await lBob.getGSCAgreement('spankHub1337')
  //console.log(col)

  console.log('Bob now sends openchannel ack to Alice')

  let isOpen = await lAlice.gsc.isAgreementOpen('spankHub1337')
  console.log('Alice state is agreement open: ' + isOpen)
  isOpen = await lBob.gsc.isAgreementOpen('spankHub1337')
  console.log('Bob state is agreement open: ' + isOpen)

  console.log(col)
  await lAlice.gsc.updateAgreement(col)

  isOpen = await lAlice.gsc.isAgreementOpen('spankHub1337')
  console.log('Alice state is agreement open: ' + isOpen)

  console.log(col.stateSignatures[0])


  let channel = {
    ID: web3.sha3('respek'),
    agreementID: 'spankHub1337',
    type: 'ether',
    balanceA: web3.toWei(0.05, 'ether'),
    balanceB: web3.toWei(0.1, 'ether')
  }

  await lAlice.openGSCChannel(channel)

  let chan = await lAlice.gsc.getChannel(channel.ID)

  console.log(chan)

  col = await lAlice.getGSCAgreement('spankHub1337')
  //console.log(col)

  let chan2 = JSON.parse(JSON.stringify(chan))
  let col2 = JSON.parse(JSON.stringify(col))
  await lBob.gsc.joinChannel(chan2, col2)

  console.log('ether channel now open')
  col = await lBob.getGSCAgreement('spankHub1337')
  console.log(col)

  let chan22 = await lBob.gsc.getChannel(channel.ID)

  console.log(chan22)

  console.log('Bob now sends ack to Alice of open etherchannel')

  console.log('Bob is initiating ether payment')

  let updateState = {
    balanceA: web3.toWei(0.06, 'ether'),
    balanceB: web3.toWei(0.09, 'ether')
  }

  await lBob.gsc.updateChannelState(channel.ID, updateState)

  let Alice_tx = await lAlice.gsc.getTransactions(agreement.ID)

  console.log(Alice_tx)

  client.quit()
}

test()