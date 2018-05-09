'use strict'

const Layer2lib = require('../src/index.js')

async function test() {
  let l = new Layer2lib('http://localhost:8545')

  try {
    let account = '0x1e8524370b7caf8dc62e3effbca04ccc8e493ffe'
    let t = await l.getMainnetBalance(account)
    console.log(t)
  } catch (e) { console.log(e) }

  console.log(l.gsc.get())

  let elem = l.utils.sha3('wubalubadubdub')
  let elems = []
  elems.push(l.utils.hexToBuffer(elem))

  try {
    let merkle = new l.merkleTree(elems)
    console.log(merkle.getRoot())
  } catch (e) { console.log (e) }
}

test()