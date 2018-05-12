'use strict'

const metachannel = require('../contracts/general-state-channels/build/contracts/MetaChannel.json')
const repo = require('./repo/repo-mem')

module.exports = function gsc (self) {
  return {
    init: async function(options) {
      //console.log(this._getMetaChannelBytecode())
      self.storage = repo(self)
    },

    openAgreement: async function(agreement) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreement.ID)) agreements[agreement.ID] = {}

      // TODO: Build get metachannel CTF bytecode and append contructor args
      let metachannelCTFaddress = {}

      let inputs = []
      inputs.push(0) // is close
      inputs.push(0) // sequence
      inputs.push(agreement.partyA) // partyA address
      inputs.push(agreement.partyB) // partyB address
      inputs.push(metachannelCTFaddress) // counterfactual metachannel address
      inputs.push('0x0') // sub-channel root hash
      inputs.push(agreement.balanceA) // balance in ether partyA
      inputs.push(agreement.balanceB) // balance in ether partyB

      agreement.stateRaw = inputs;
      agreement.stateSerialized = self.utils.serializeState(inputs)
      // TODO: self.utils.sign()
      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      agreement.signatures.push(self.utils.sign(stateHash, self.privateKey))

      self.publicKey = self.utils.bufferToHex(self.utils.ecrecover(stateHash, agreement.signatures[0].v, agreement.signatures[0].r, agreement.signatures[0].s))
      
      Object.assign(agreements[agreement.ID], agreement)

      //agreements.agreements[options.ID] = options

      // {
      //   agreements: {
      //     spankhub123: {

      //     },
      //     alice: {

      //     },
      //     bob: {

      //     }
      //   },
      //   someotherstate: {

      //   }
      // }

      await self.storage.set('agreements', agreements)
      console.log('Agreement stored in db, deploying contract')
    },

    findAgreement: async function(agreementID) {
      let _agreements = await self.storage.get('agreements')
      // let data = agreement.find({})
      // let readable = await data.toArray()
      // console.log(data)
      return _agreements[agreementID]

    },

    getSubchannel: async function(agreementID, channelID) {
      let agreement = self.storage.get(agreementID)
      //console.log(chan)
    },

    _getMetaChannelBytecode: function() {
      return metachannel.deployedBytecode
    }
  }
}
