'use strict'
const Web3 = require('web3')
const web3 = new Web3()
const Layer2lib = require('../src/index.js')

async function test() {
  let l = new Layer2lib('http://localhost:8545')
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

  try {
    let account = '0xa84135fdbd790a6feeffd204b14a103bb2e41e92'
    let t = await l.getMainnetBalance(account)
    console.log(t)
  } catch (e) { console.log(e) }

  l.gsc.init()

  let agreement = {
    ID: 'spankHub',
    partyA: web3.eth.accounts[0],
    partyB: web3.eth.accounts[1],
    type: 'ether'
  }

  //l.gsc.openAgreement(agreement)
  let col = await l.gsc.findAllAgreements(agreement.ID)

  console.log(col)

  let elem = l.utils.sha3('wubalubadubdub')
  let elems = []
  elems.push(l.utils.hexToBuffer(elem))

  try {
    let merkle = new l.merkleTree(elems)
    console.log(merkle.getRoot())
  } catch (e) { console.log (e) }
}

test()