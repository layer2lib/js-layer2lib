'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')

let etherPaymentIntAddress = '0x'
let etherPaymentExtAddress = '0x'
let CTFregistryAddress = '0x'

async function test() {
  let options = {
    provider: 'http://localhost:8545',
    db: {},
    privateKey: '0x2c339e1afdbfd0b724a4793bf73ec3a4c235cceb131dcd60824a06cefbef9875'
  }

  let l = new Layer2lib(options)

  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

  try {
    let account = '0xa84135fdbd790a6feeffd204b14a103bb2e41e92'
    let t = await l.getMainnetBalance(account)
    console.log(t)
  } catch (e) { console.log(e) }

  l.initGSC()

  let agreement = {
    ID: 'spankHub1337',
    partyA: web3.eth.accounts[0], // Viewer or performer public key
    partyB: web3.eth.accounts[1], // Spank Hub public key
    balanceA: web3.toWei(0.1, 'ether'),
    balanceB: web3.toWei(0.2, 'ether'),
    openPending: true,
    inDispute: false,
    stateRaw: [],
    stateSerialized: '0x',
    signatures: [],
    subChannels: {}
  }

  await l.createGSCAgreement(agreement)

  agreement = {
    ID: 'Bob4206969',
    partyA: web3.eth.accounts[0], // Viewer or performer public key
    partyB: web3.eth.accounts[1], // Spank Hub public key
    balanceA: web3.toWei(0.1, 'ether'),
    balanceB: web3.toWei(0.2, 'ether'),
    openPending: true,
    inDispute: false,
    stateRaw: [],
    stateSerialized: '0x',
    signatures: [],
    subChannels: {}
  }

  await l.createGSCAgreement(agreement)

  let col = await l.getGSCAgreement('spankHub1337')
  console.log(col)

  col = await l.getGSCAgreement('Bob4206969')
  console.log(col)

  let subChan = {
    type: 'ether'
  }

  let elem = l.utils.sha3('wubalubadubdub')
  let elems = []
  elems.push(l.utils.hexToBuffer(elem))

  try {
    let merkle = new l.merkleTree(elems)
    console.log(merkle.getRoot())
  } catch (e) { console.log (e) }
}

test()