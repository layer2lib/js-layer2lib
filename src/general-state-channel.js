'use strict'

const metachannel = require('../contracts/general-state-channels/build/contracts/MetaChannel.json')
const repo = require('./repo/repo-mem')

module.exports = function gsc (self) {
  return {
    init: async function(options) {
      //console.log(this._getMetaChannelBytecode())
      self.storage = repo(self)
      self.etherExtension = '0x32c1d681fe917170573aed0671d21317f14219fd'
      self.bidirectEtherInterpreter = '0x74926af30d35337e45225666bbf49e156fd08016'
    },

    openAgreement: async function(agreement) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreement.ID)) agreements[agreement.ID] = {}

      let metaByteCode = metachannel.deployedBytecode
      let args = ['0x1337', agreement.partyA, agreement.partyB]
      let signers = [agreement.partyA, agreement.partyB]
      let metaCTFbytes = self.utils.getCTFstate(metaByteCode, signers, args)
      let metachannelCTFaddress = self.utils.getCTFaddress(metaCTFbytes)

      //agreement.metaCTFbytes = metaCTFbytes
      agreement.metachannelCTFaddress = metachannelCTFaddress

      let initialState = []
      initialState.push(0) // is close
      initialState.push(0) // sequence
      initialState.push(agreement.partyA) // partyA address
      initialState.push(agreement.partyB) // partyB address
      initialState.push(metachannelCTFaddress) // counterfactual metachannel address
      initialState.push('0x0') // sub-channel root hash
      initialState.push(agreement.balanceA) // balance in ether partyA
      initialState.push(agreement.balanceB) // balance in ether partyB

      agreement.stateRaw = initialState;
      agreement.stateSerialized = self.utils.serializeState(initialState)
      // TODO: self.utils.sign()
      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      agreement.signatures.push(self.utils.sign(stateHash, self.privateKey))

      // TODO deploy and call openAgreement on msig wallet
      // save msig deploy address to agreement object

      self.publicKey = self.utils.bufferToHex(self.utils.ecrecover(stateHash, agreement.signatures[0].v, agreement.signatures[0].r, agreement.signatures[0].s))
      
      Object.assign(agreements[agreement.ID], agreement)

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

    joinAgreement: async function(agreement) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreement.ID)) agreements[agreement.ID] = {}

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      agreement.signatures.push(self.utils.sign(stateHash, self.privateKey))
      agreement.openPending = false;

      self.publicKey = self.utils.bufferToHex(self.utils.ecrecover(stateHash, agreement.signatures[1].v, agreement.signatures[1].r, agreement.signatures[1].s))

      Object.assign(agreements[agreement.ID], agreement)

      await self.storage.set('agreements', agreements)

      console.log('Agreement stored in db, responding deployed contract')
    },

    updateAgreement: async function(agreement) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreement.ID)) agreements[agreement.ID] = {}

      Object.assign(agreements[agreement.ID], agreement)

      await self.storage.set('agreements', agreements)

      console.log('Agreement updated in db')
    },

    findAgreement: async function(agreementID) {
      let _agreements = await self.storage.get('agreements')
      // let data = agreement.find({})
      // let readable = await data.toArray()
      // console.log(data)
      return _agreements[agreementID]

    },

    isAgreementOpen: async function(agreementID) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreementID)) return false
      let agreement = agreements[agreementID]
      if(agreement.openPending == true) return false
      if(agreement.signatures.length != 2) return false

      return true

    },

    getSubchannel: async function(agreementID, channelID) {
      let agreement = self.storage.get(agreementID)
      //console.log(chan)
    }
  }
}
