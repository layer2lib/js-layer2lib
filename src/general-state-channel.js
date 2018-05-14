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
      self.registryAddress = '0x4200'
    },

    openAgreement: async function(agreement) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreement.ID)) agreements[agreement.ID] = {}

      agreement.openPending = true
      agreement.inDispute = false
      agreement.stateRaw = []
      agreement.metaSignatures = []
      agreement.channels = []
      agreement.channelRootHash = '0x0'

      let metaByteCode = metachannel.deployedBytecode
      let args = ['0x1337', agreement.partyA, agreement.partyB]
      let signers = [agreement.partyA, agreement.partyB]
      let metaCTFbytes = self.utils.getCTFstate(metaByteCode, signers, args)
      let metachannelCTFaddress = self.utils.getCTFaddress(metaCTFbytes)

      //agreement.metaCTFbytes = metaCTFbytes
      agreement.metachannelCTFaddress = metachannelCTFaddress
      agreement.metaSignatures.push(self.utils.sign(agreement.metachannelCTFaddress, self.privateKey))

      let initialState = []
      initialState.push(0) // is close
      initialState.push(0) // sequence
      initialState.push(agreement.partyA) // partyA address
      initialState.push(agreement.partyB) // partyB address
      initialState.push(metachannelCTFaddress) // counterfactual metachannel address
      initialState.push('0x0') // sub-channel root hash
      initialState.push(agreement.balanceA) // balance in ether partyA
      initialState.push(agreement.balanceB) // balance in ether partyB

      agreement.stateRaw[0] = initialState;
      agreement.stateSerialized = self.utils.serializeState(initialState)

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      agreement.stateSignatures = []
      let state0sigs = []
      state0sigs.push(self.utils.sign(stateHash, self.privateKey))
      agreement.stateSignatures.push(state0sigs)

      // TODO deploy and call openAgreement on msig wallet
      // save msig deploy address to agreement object
      let msigAddress = '0x0'
      agreement.address = msigAddress

      self.publicKey = self.utils.bufferToHex(self.utils.ecrecover(stateHash, state0sigs[0].v, state0sigs[0].r, state0sigs[0].s))
      
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
      agreement.stateSignatures[0].push(self.utils.sign(stateHash, self.privateKey))
      agreement.openPending = false;

      self.publicKey = self.utils.bufferToHex(
        self.utils.ecrecover(
          stateHash, 
          agreement.stateSignatures[0][1].v, 
          agreement.stateSignatures[0][1].r, 
          agreement.stateSignatures[0][1].s
          )
        )

      Object.assign(agreements[agreement.ID], agreement)

      await self.storage.set('agreements', agreements)

      console.log('Agreement stored in db, responding to deployed contract')
    },

    updateAgreement: async function(agreement) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreement.ID)) agreements[agreement.ID] = {}

      Object.assign(agreements[agreement.ID], agreement)

      await self.storage.set('agreements', agreements)

      console.log('Agreement updated in db')
    },

    getAgreement: async function(agreementID) {
      let _agreements = await self.storage.get('agreements')
      // let data = agreement.find({})
      // let readable = await data.toArray()
      // console.log(data)
      return _agreements[agreementID]

    },

    startSettleAgreement: async function(agreementID) {
      // Require that there are no open channels!

      // TODO: instantiate metachannel, call startSettle 
    },

    challengeAgreement: async function(agreementID) {
      // TODO: call challengeSettle on metachannel
    },

    closeByzantineAgreement: async function(agreementID) {
      // TODO: call msig closeWithMetachannel

    },

    isAgreementOpen: async function(agreementID) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreementID)) return false
      let agreement = agreements[agreementID]
      if(agreement.openPending == true) return false
      if(agreement.stateSignatures.length != 2) return false

      // TODO: Check blockchain for confirmed open status
      return true

    },

    // channel functions

    createChannel: async function(channel) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(channel.agreementID)) return
      let agreement = agreements[channel.agreementID]

      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(channel.ID)) channels[channel.ID] = {}

      channel.openPending = true
      channel.inDispute = false
      channel.stateRaw = []
      channel.signatures = []

      if(channel.type == 'ether') {
        var subchannelInputs = []
        subchannelInputs.push(0) // is close
        subchannelInputs.push(0) // is force push channel
        subchannelInputs.push(0) // subchannel sequence
        subchannelInputs.push(0) // timeout length ms
        subchannelInputs.push(self.bidirectEtherInterpreter) // ether payment interpreter library address
        subchannelInputs.push(channel.ID) // ID of subchannel
        subchannelInputs.push(agreement.metachannelCTFaddress) // counterfactual metachannel address
        subchannelInputs.push(self.registryAddress) // CTF registry address
        subchannelInputs.push('0x0') // subchannel tx roothash
        subchannelInputs.push(agreement.partyA) // partyA in the subchannel
        subchannelInputs.push(agreement.partyB) // partyB in the subchannel
        subchannelInputs.push(channel.balanceA) // balance of party A in subchannel (ether)
        subchannelInputs.push(channel.balanceB) // balance of party B in subchannel (ether)

        channel.stateRaw = subchannelInputs
        channel.stateSerialized = self.utils.serializeState(subchannelInputs)

      }

      let channelHash = self.web3.sha3(channel.stateSerialized, {encoding: 'hex'})

      // calculate channel root hash
      let elem = self.utils.sha3(channelHash)

      let elems = []
      for(var i=0; i<agreement.channels.length; i++) { elems.push(agreement.channels[i]) }

      elems.push(self.utils.hexToBuffer(elem))

      // add new element to the agreements lits of channels
      agreement.channels.push(elem)

      let merkle = new self.merkleTree(elems)

      // put root hash in agreement state
      let channelRoot = self.utils.bufferToHex(merkle.getRoot())
      agreement.channelRootHash = channelRoot

      // serialize and sign s1 of agreement state
      let newState = JSON.parse(JSON.stringify(agreement.stateRaw[agreement.stateRaw.length-1]))
      newState[5] = channelRoot
      // set nonce 
      newState[1]++

      //adjust balance
      newState[6] = newState[6] - channel.balanceA
      newState[7] = newState[7] - channel.balanceB

      // push the new sig of new state into agreement object
      agreement.stateRaw.push(newState)
      agreement.stateSerialized = self.utils.serializeState(newState)

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      let stateSig = []
      stateSig.push(self.utils.sign(stateHash, self.privateKey))
      agreement.stateSignatures.push(stateSig)



      // store the channel
      Object.assign(channels[channel.ID], channel)
      await self.storage.set('channels', channels)

      // store the new agreement
      Object.assign(agreements[agreement.ID], agreement)
      await self.storage.set('agreements', agreements)
    },

    joinChannel: async function(channel, agreement) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreement.ID)) return

      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(channel.ID)) channels[channel.ID] = {}

      // let channelHash = self.web3.sha3(channel.stateSerialized, {encoding: 'hex'})

      // // calculate channel root hash
      // let elem = self.utils.sha3(channelHash)

      // let elems = []
      // for(var i=0; i<agreement.channels.length; i++) { elems.push(agreement.channels[i]) }

      // elems.push(self.utils.hexToBuffer(elem))

      // let merkle = new self.merkleTree(elems)

      // // check root hash in agreement state
      // let channelRoot = self.utils.bufferToHex(merkle.getRoot())

      // if(channelRoot != agreement.stateRaw[4]) return


      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      agreement.stateSignatures[agreement.stateSignatures.length-1][1] = self.utils.sign(stateHash, self.privateKey)

      // store the channel
      Object.assign(channels[channel.ID], channel)
      await self.storage.set('channels', channels)

      // store the new agreement
      Object.assign(agreements[agreement.ID], agreement)
      await self.storage.set('agreements', agreements)
    },

    updateChannelState: async function(channelID, updateState) {

    },

    getChannel: async function(channelID) {
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(channelID)) channels[channelID] = {}

      return channels[channelID]
      //console.log(chan)
    }
  }
}
