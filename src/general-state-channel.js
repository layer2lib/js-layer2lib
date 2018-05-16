'use strict'

const metachannel = require('../contracts/general-state-channels/build/contracts/MetaChannel.json')
const repo = require('./repo/repo')

module.exports = function gsc (self) {
  return {
    init: async function(options) {
      //console.log(this._getMetaChannelBytecode())
      self.storage = repo(self)
      self.etherExtension = '0x32c1d681fe917170573aed0671d21317f14219fd'
      self.bidirectEtherInterpreter = '0x74926af30d35337e45225666bbf49e156fd08016'
      self.registryAddress = '0x4200'
    },

    createAgreement: async function(agreement) {
      let entryID = agreement.ID+agreement.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(entryID)) agreements[entryID] = {}

      // OVERWRITE OLD DATABASE TX ENTRIES IF THEY EXIST FOR THIS AGREEMENT
      let txs = await self.storage.get('transactions') || {}
      if(!txs.hasOwnProperty(entryID)) txs[entryID] = []

      let rawStates = await self.storage.get('states') || {}
      if(!rawStates.hasOwnProperty(entryID)) rawStates[entryID] = []

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

      rawStates[entryID].push(initialState)

      agreement.stateSerialized = self.utils.serializeState(initialState)

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      agreement.stateSignatures = []
      let state0sigs = []
      state0sigs.push(self.utils.sign(stateHash, self.privateKey))
      agreement.stateSignatures.push(state0sigs)

      let tx = {
        agreement: agreement.ID,
        channel: 'master',
        nonce: 0,
        timestamp: Date.now(),
        data: 'Open Agreement',
        txHash: '0x0'
      }
      txs[entryID].push(tx)

      // TODO deploy and call openAgreement on msig wallet
      // save msig deploy address to agreement object
      let msigAddress = '0x0'
      agreement.address = msigAddress

      self.publicKey = self.utils.bufferToHex(self.utils.ecrecover(stateHash, state0sigs[0].v, state0sigs[0].r, state0sigs[0].s))
      
      Object.assign(agreements[entryID], agreement)
      // Object.assign(txs[entryID], txList)
      // Object.assign(rawStates[entryID], rawStatesList)

      await self.storage.set('agreements', agreements)
      await self.storage.set('transactions', txs)
      await self.storage.set('states', rawStates)
      console.log('Agreement and tx stored in db, deploying contract')
    },

    joinAgreement: async function(agreement, state) {
      let entryID = agreement.ID+agreement.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(entryID)) agreements[entryID] = {}

      let txs = await self.storage.get('transactions') || {}
      if(!txs.hasOwnProperty(entryID)) txs[entryID] = []

      let rawStates = await self.storage.get('states') || {}
      if(!rawStates.hasOwnProperty(entryID)) rawStates[entryID] = []

      rawStates[entryID].push(state)

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      agreement.stateSignatures[0].push(self.utils.sign(stateHash, self.privateKey))
      agreement.openPending = false;

      let tx = {
        agreement: agreement.ID,
        channel: 'master',
        nonce: 0,
        timestamp: Date.now(),
        data: 'Join Agreement',
        txHash: '0x0'
      }
      txs[entryID].push(tx)

      self.publicKey = self.utils.bufferToHex(
        self.utils.ecrecover(
          stateHash, 
          agreement.stateSignatures[0][1].v, 
          agreement.stateSignatures[0][1].r, 
          agreement.stateSignatures[0][1].s
          )
        )

      Object.assign(agreements[entryID], agreement)
      // Object.assign(txs[entryID], txList)
      // Object.assign(rawStates[entryID], rawStatesList)

      await self.storage.set('agreements', agreements)
      await self.storage.set('transactions', txs)
      await self.storage.set('states', rawStates)

      console.log('Agreement stored in db, responding to deployed contract')
    },

    updateAgreement: async function(agreement) {
      let entryID = agreement.ID+agreement.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(entryID)) agreements[entryID] = {}

      Object.assign(agreements[entryID], agreement)

      await self.storage.set('agreements', agreements)

      console.log('Agreement updated in db')
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
      if(agreement.stateSignatures[0].length != 2) return false

      // TODO: Check blockchain for confirmed open status
      return true

    },

    // channel functions

    openChannel: async function(channel) {
      let AgreeEntryID = channel.agreementID+channel.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(AgreeEntryID)) return
      let agreement = agreements[AgreeEntryID]

      let ChanEntryID = channel.ID+channel.dbSalt
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(ChanEntryID)) channels[ChanEntryID] = {}

      let rawStatesChannel = await self.storage.get('states') || {}
      if(!rawStatesChannel.hasOwnProperty(ChanEntryID)) rawStatesChannel[ChanEntryID] = []

      let rawStatesAgreement = await self.storage.get('states') || {}
      if(!rawStatesAgreement.hasOwnProperty(AgreeEntryID)) return

      channel.openPending = true
      channel.inDispute = false
      //channel.stateRaw = []

      var subchannelInputs = []

      if(channel.type == 'ether') {
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
      }

      //channel.stateRaw = subchannelInputs
      rawStatesChannel[ChanEntryID].push(subchannelInputs)
      channel.stateSerialized = self.utils.serializeState(subchannelInputs)

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
      //let newState = JSON.parse(JSON.stringify(agreement.stateRaw[agreement.stateRaw.length-1]))
      console.log('-----------------------')
      console.log('internal getstates call')
      let oldStates = await this.getStates(AgreeEntryID)
      console.log('-----------------------')
      //console.log(oldStates)

      // grab latest state and modify it
      let newState = JSON.parse(JSON.stringify(oldStates[oldStates.length-1]))
      newState[5] = channelRoot
      // set nonce 
      newState[1]++

      // TODO module this
      if(agreement.types[0] === 'Ether') {
        //adjust balance
        newState[6] = newState[6] - channel.balanceA
        newState[7] = newState[7] - channel.balanceB
      }

      // push the new sig of new state into agreement object
      //agreement.stateRaw.push(newState)
      //console.log(rawStatesAgreement[AgreeEntryID])
      rawStatesAgreement[AgreeEntryID].push(newState)
      //console.log(rawStatesAgreement[AgreeEntryID])

      agreement.stateSerialized = self.utils.serializeState(newState)

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      let stateSig = []
      stateSig.push(self.utils.sign(stateHash, self.privateKey))
      agreement.stateSignatures.push(stateSig)



      // store the channel
      Object.assign(channels[ChanEntryID], channel)
      await self.storage.set('channels', channels)

      // store the new agreement
      Object.assign(agreements[AgreeEntryID], agreement)
      await self.storage.set('agreements', agreements)

      // store state
      await self.storage.set('states', rawStatesChannel)

      // store state
      await self.storage.set('states', rawStatesAgreement)
    },

    joinChannel: async function(channel, agreement, channelState) {
      let AgreeEntryID = agreement.ID+channel.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(AgreeEntryID)) return

      let ChanEntryID = channel.ID+channel.dbSalt
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(ChanEntryID)) channels[ChanEntryID] = {}

      let rawStatesChannel = await self.storage.get('states') || {}
      if(!rawStatesChannel.hasOwnProperty(ChanEntryID)) rawStatesChannel[ChanEntryID] = []

      let rawStatesAgreement = await self.storage.get('states') || {}
      if(!rawStatesAgreement.hasOwnProperty(AgreeEntryID)) return

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
      Object.assign(channels[ChanEntryID], channel)
      await self.storage.set('channels', channels)

      // store the new agreement
      Object.assign(agreements[AgreeEntryID], agreement)
      await self.storage.set('agreements', agreements)

      // store state
      Object.assign(rawStates[ChanEntryID], rawStatesList)
      await self.storage.set('states', rawStates)
    },

    updateChannelState: async function(id, updateState) {
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(id)) return
      let channel = channels[id]

      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(channel.agreementID+channel.dbSalt)) return
      let agreement = agreements[channel.ID+channel.dbSalt]

      // TODO: create modules for each interpreter type
      if(channel.type == 'ether') {
        console.log('ETHERRRR')
      }
    },


    startSettleChannel: async function(channelID) {
      // Require that there are no open channels!

      // TODO: instantiate metachannel, call startSettle 
    },

    challengeChannelt: async function(channelID) {
      // TODO: call challengeSettle on metachannel
    },

    closeByzantineChannel: async function(channelID) {
      // TODO: call msig closeWithMetachannel

    },

    getAgreement: async function(agreementID) {
      let _agreements = await self.storage.get('agreements')
      return _agreements[agreementID]

    },

    getChannel: async function(channelID) {
      let channels = await self.storage.get('channels')
      return channels[channelID]
    },

    getTransactions: async function(agreementID) {
      let _txs = await self.storage.get('transactions')
      return _txs[agreementID]
    },

    getStates: async function(ID) {
      let _states = await self.storage.get('states')
      return _states[ID]
    },


    syncDatabase: async function(agreement) {

    },

    clearStorage: async function() {
      await self.storage.set('agreements', {})
      await self.storage.set('transactions', {})
      await self.storage.set('states', {})
    }
  }
}
