'use strict'

const metachannel = require('../contracts/general-state-channels/build/contracts/MetaChannel.json')
const msig = require('../contracts/general-state-channels/build/contracts/MultiSig.json')
const repo = require('./repo/repo')

module.exports = function gsc (self) {
  return {
    init: async function(options) {
      // TODO: Check against counterfactual registry and see if any
      // of the channels are being challenged when online
      self.storage = repo(self)
      self.etherExtension = '0x32c1d681fe917170573aed0671d21317f14219fd'
      self.bidirectEtherInterpreter = '0x74926af30d35337e45225666bbf49e156fd08016'
      self.registryAddress = '0x72be812074e5618786f1953662b8af1ec344231c'
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
      agreement.metaSignatures = []
      agreement.channels = []
      agreement.channelRootHash = '0x0'

      const metaByteCode = metachannel.bytecode

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


      // TODO deploy and call openAgreement on msig wallet
      // save msig deploy address to agreement object
      const msigBytecode = msig.bytecode
      let msigArgs = [msigBytecode, metachannelCTFaddress, self.registryAddress]
      let msigDeployBytes = self.utils.serializeState(msigArgs)
      let msigAddress = await self.utils.deployContract(msigDeployBytes)
      //let msigAddress = msig_tx_hash
      agreement.address = msigAddress

      //console.log(msig.openAgreement.getData(intialState, self.etherExtension, 28, '0x0', '0x0'))
      // TODO: call deployed msig
      let openTxHash = await self.utils.executeOpenAgreement(
        msig.abi, 
        msigAddress, 
        agreement.stateSerialized, 
        self.etherExtension, 
        state0sigs[0], 
        agreement.balanceA
      )


      let tx = {
        agreement: agreement.ID,
        channel: 'master',
        nonce: 0,
        timestamp: Date.now(),
        data: 'Open Agreement',
        txHash: openTxHash
      }
      txs[entryID].push(tx)


      self.publicKey = self.utils.bufferToHex(self.utils.ecrecover(stateHash, state0sigs[0].v, state0sigs[0].r, state0sigs[0].s))
      
      Object.assign(agreements[entryID], agreement)
      // Object.assign(txs[entryID], txList)
      // Object.assign(rawStates[entryID], rawStatesList)

      await self.storage.set('agreements', agreements)
      await self.storage.set('transactions', txs)
      await self.storage.set('states', rawStates)
      console.log('Agreement and tx stored in db, deploying contract')
    },

    // TODO: Replace agreement with just the state sig from counterparty
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

      self.publicKey = self.utils.bufferToHex(
        self.utils.ecrecover(
          stateHash, 
          agreement.stateSignatures[0][1].v, 
          agreement.stateSignatures[0][1].r, 
          agreement.stateSignatures[0][1].s
          )
        )

      let joinTxHash = await self.utils.executeJoinAgreement(
        msig.abi, 
        agreement.address, 
        agreement.stateSerialized, 
        self.etherExtension, 
        agreement.stateSignatures[0][1], 
        agreement.balanceB
      )

      let tx = {
        agreement: agreement.ID,
        channel: 'master',
        nonce: 0,
        timestamp: Date.now(),
        data: 'Join Agreement',
        txHash: joinTxHash
      }
      txs[entryID].push(tx)

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

    closeAgreement: async function(agreementID) {

    },

    confirmCloseAgreement: async function(agreementID) {

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

      let rawStates = await self.storage.get('states') || {}
      if(!rawStates.hasOwnProperty(ChanEntryID)) rawStates[ChanEntryID] = []
      if(!rawStates.hasOwnProperty(AgreeEntryID)) return

      let txs = await self.storage.get('transactions') || {}
      if(!txs.hasOwnProperty(ChanEntryID)) txs[ChanEntryID] = []


      channel.openPending = true
      channel.inDispute = false

      var channelInputs = []

      if(channel.type == 'ether') {
        channelInputs.push(0) // is close
        channelInputs.push(0) // is force push channel
        channelInputs.push(0) // channel sequence
        channelInputs.push(0) // timeout length ms
        channelInputs.push(self.bidirectEtherInterpreter) // ether payment interpreter library address
        channelInputs.push(channel.ID) // ID of channel
        channelInputs.push(agreement.metachannelCTFaddress) // counterfactual metachannel address
        channelInputs.push(self.registryAddress) // CTF registry address
        channelInputs.push('0x0') // channel tx roothash
        channelInputs.push(agreement.partyA) // partyA in the channel
        channelInputs.push(agreement.partyB) // partyB in the channel
        channelInputs.push(channel.balanceA) // balance of party A in channel (ether)
        channelInputs.push(channel.balanceB) // balance of party B in channel (ether)
      }

      rawStates[ChanEntryID].push(channelInputs)
      channel.stateSerialized = self.utils.serializeState(channelInputs)
      channel.stateRaw = channelInputs

      // calculate channel root hash
      let elem = self.utils.sha3(channel.stateSerialized, {encoding: 'hex'})

      let elems = []
      for(var i=0; i<agreement.channels.length; i++) { elems.push(self.utils.hexToBuffer(agreement.channels[i])) }

      elems.push(self.utils.hexToBuffer(elem))

      // add new element to the agreements lits of channels
      agreement.channels.push(elem)

      let merkle = new self.merkleTree(elems)

      // put root hash in agreement state
      let channelRoot = self.utils.bufferToHex(merkle.getRoot())
      agreement.channelRootHash = channelRoot

      // serialize and sign s1 of agreement state
      let oldStates = rawStates[AgreeEntryID]

      // grab latest state and modify it
      let newState = JSON.parse(JSON.stringify(oldStates[oldStates.length-1]))
      newState[5] = channelRoot
      // set nonce 
      newState[1]++

      // TODO module this
      if(agreement.types[0] === 'Ether') {
        //adjust balance on agreement state
        newState[6] = newState[6] - channel.balanceA
        newState[7] = newState[7] - channel.balanceB
        // update ether agreement balance
        agreement.balanceA = agreement.balanceA - channel.balanceA
        agreement.balanceB = agreement.balanceB - channel.balanceB
      }

      // push the new sig of new state into agreement object
      rawStates[AgreeEntryID].push(newState)

      agreement.stateSerialized = self.utils.serializeState(newState)

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      let stateSig = []
      stateSig.push(self.utils.sign(stateHash, self.privateKey))
      agreement.stateSignatures.push(stateSig)

      let tx_nonce
      if(txs[ChanEntryID].length === 0) {
        tx_nonce = 0
      } else {
        tx_nonce = txs[ChanEntryID][txs[ChanEntryID].length-1].nonce++
      }

      let tx = {
        agreement: agreement.ID,
        channel: channel.ID,
        nonce: tx_nonce,
        timestamp: Date.now(),
        data: 'Open Channel',
        txHash: '0x0'
      }
      txs[ChanEntryID].push(tx)

      // store the channel
      Object.assign(channels[ChanEntryID], channel)
      await self.storage.set('channels', channels)

      // store the new agreement
      Object.assign(agreements[AgreeEntryID], agreement)
      await self.storage.set('agreements', agreements)

      // store state
      await self.storage.set('states', rawStates)
      await self.storage.set('transactions', txs)
    },

    // TODO: replace agreement param with signature
    joinChannel: async function(channel, agreement, channelState) {
      let AgreeEntryID = agreement.ID+channel.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(AgreeEntryID)) return

      let ChanEntryID = channel.ID+channel.dbSalt
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(ChanEntryID)) channels[ChanEntryID] = {}

      let rawStates = await self.storage.get('states') || {}
      if(!rawStates.hasOwnProperty(ChanEntryID)) rawStates[ChanEntryID] = []
      if(!rawStates.hasOwnProperty(AgreeEntryID)) return

      let txs = await self.storage.get('transactions') || {}
      if(!txs.hasOwnProperty(ChanEntryID)) txs[ChanEntryID] = []

      rawStates[ChanEntryID].push(channelState)

      // serialize and sign s1 of agreement state
      let oldStates = rawStates[AgreeEntryID]
      //console.log(oldStates)

      // grab latest state and modify it
      let newState = JSON.parse(JSON.stringify(oldStates[oldStates.length-1]))
      //console.log(newState)
      newState[5] = agreement.channelRootHash
      // set nonce 
      newState[1]++

      // TODO module this
      if(agreement.types[0] === 'Ether') {
        //adjust balance on agreement state
        newState[6] = newState[6] - channel.balanceA
        newState[7] = newState[7] - channel.balanceB
        // HACKY
        // // update ether agreement balance
        // agreement.balanceA = agreement.balanceA - channel.balanceA
        // agreement.balanceB = agreement.balanceB - channel.balanceB
      }
      //console.log(newState)

      // push the new sig of new state into agreement object
      rawStates[AgreeEntryID].push(newState)
      //console.log(rawStates[AgreeEntryID])

      // TODO: Check the incoming agreement (from Alice) on new channel creation
      // has Alices signature. When signatures are in their own database, in append
      // only log format keyed by the channel or agreement they belong to, we will 
      // check that the ecrecover of the raw channel state passed matches the supplied
      // sig. ecrecover(rawChannelStateHash, sig)

      //TODO: check that the channel state provided is valid

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

      channel.openPending = false

      let tx_nonce
      if(txs[ChanEntryID].length === 0) {
        tx_nonce = 0
      } else {
        tx_nonce = txs[ChanEntryID][txs[ChanEntryID].length-1].nonce++
      }

      let tx = {
        agreement: agreement.ID,
        channel: channel.ID,
        nonce: tx_nonce,
        timestamp: Date.now(),
        data: 'Join Channel',
        txHash: '0x0'
      }
      txs[ChanEntryID].push(tx)

      // store the channel
      Object.assign(channels[ChanEntryID], channel)
      await self.storage.set('channels', channels)

      // store the new agreement
      Object.assign(agreements[AgreeEntryID], agreement)
      await self.storage.set('agreements', agreements)

      // store state
      await self.storage.set('states', rawStates)
      await self.storage.set('transactions', txs)
    },

    initiateUpdateChannelState: async function(id, updateState) {
      let ChanEntryID = id
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(ChanEntryID)) return
      let channel = await this.getChannel(ChanEntryID)

      let AgreeEntryID = channel.agreementID+channel.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(AgreeEntryID)) return
      let agreement = await this.getAgreement(AgreeEntryID)

      let rawStates = await self.storage.get('states') || {}
      if(!rawStates.hasOwnProperty(ChanEntryID)) return
      if(!rawStates.hasOwnProperty(AgreeEntryID)) return

      let txs = await self.storage.get('transactions') || {}
      if(!txs.hasOwnProperty(ChanEntryID)) return

      let l = rawStates[ChanEntryID].length
      let chanState = rawStates[ChanEntryID][l-1].slice(0)

      // get old channel hash
      let oldStateHash = self.utils.sha3(channel.stateSerialized, {encoding: 'hex'})

      let l2 = rawStates[AgreeEntryID].length
      let agreementState = rawStates[AgreeEntryID][l2-1].slice(0)

      // TODO: create modules for each interpreter type
      if(channel.type == 'ether') {
        chanState[2]++
        chanState[11] = updateState.balanceA
        chanState[12] = updateState.balanceB
      }

      channel.balanceA = updateState.balanceA
      channel.balanceB = updateState.balanceB

      rawStates[ChanEntryID].push(chanState)

      channel.stateSerialized = self.utils.serializeState(chanState)
      channel.stateRaw = chanState

      // calculate channel root hash
      let elem = self.utils.sha3(channel.stateSerialized, {encoding: 'hex'})

      let elems = agreement.channels.slice(0)
 
      for(var i=0; i<agreement.channels.length; i++) { 
        if(oldStateHash === elems[i]) {
          agreement.channels[i] = elem
          elems[i] = elem
        }
        elems[i] = self.utils.hexToBuffer(elems[i])
      }

      let merkle = new self.merkleTree(elems)

      // put root hash in agreement state
      let channelRoot = self.utils.bufferToHex(merkle.getRoot())
      agreement.channelRootHash = channelRoot

      // serialize and sign s1 of agreement state
      let oldStates = rawStates[AgreeEntryID]

      // grab latest state and modify it
      let newState = JSON.parse(JSON.stringify(oldStates[oldStates.length-1]))
      newState[5] = channelRoot
      newState[1]++

      // push the new sig of new state into agreement object
      rawStates[AgreeEntryID].push(newState)

      agreement.stateSerialized = self.utils.serializeState(newState)

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      let stateSig = []
      stateSig.push(self.utils.sign(stateHash, self.privateKey))
      agreement.stateSignatures.push(stateSig)

      let tx_nonce
      if(txs[ChanEntryID].length === 0) {
        tx_nonce = 0
      } else {
        tx_nonce = txs[ChanEntryID][txs[ChanEntryID].length-1].nonce
        tx_nonce++
      }

      let tx = {
        agreement: agreement.ID,
        channel: channel.ID,
        nonce: tx_nonce,
        timestamp: Date.now(),
        data: updateState,
        txHash: self.web3.sha3(updateState.toString(), {encoding: 'hex'})
      }
      txs[ChanEntryID].push(tx)

      // store the channel
      Object.assign(channels[ChanEntryID], channel)
      await self.storage.set('channels', channels)

      // store the new agreement
      Object.assign(agreements[AgreeEntryID], agreement)
      await self.storage.set('agreements', agreements)

      // store state
      await self.storage.set('states', rawStates)
      await self.storage.set('transactions', txs)
    },

    confirmUpdateChannelState: async function(updateChannel, updateAgreement, updateState) {
      let ChanEntryID = updateChannel.ID+updateChannel.dbSalt
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(ChanEntryID)) return
      let channel = await this.getChannel(ChanEntryID)

      let AgreeEntryID = channel.agreementID+channel.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(AgreeEntryID)) return
      let agreement = await this.getAgreement(AgreeEntryID)

      let rawStates = await self.storage.get('states') || {}
      if(!rawStates.hasOwnProperty(ChanEntryID)) return
      if(!rawStates.hasOwnProperty(AgreeEntryID)) return

      let txs = await self.storage.get('transactions') || {}
      if(!txs.hasOwnProperty(ChanEntryID)) return


      // require this
      let isValidUpdate = this._verifyUpdate(updateAgreement, agreement, channel, updateState)

      rawStates[ChanEntryID].push(channel.stateRaw)

      // serialize and sign s1 of agreement state
      let oldStates = rawStates[AgreeEntryID]

      // grab latest state and modify it
      let newState = JSON.parse(JSON.stringify(oldStates[oldStates.length-1]))
      newState[5] = updateAgreement.channelRootHash
      newState[1]++

      // add latest state
      rawStates[AgreeEntryID].push(newState)

      let stateHash = self.web3.sha3(updateAgreement.stateSerialized, {encoding: 'hex'})
      updateAgreement.stateSignatures[updateAgreement.stateSignatures.length-1][1] = self.utils.sign(stateHash, self.privateKey)

      let tx_nonce
      if(txs[ChanEntryID].length === 0) {
        tx_nonce = 0
      } else {
        tx_nonce = txs[ChanEntryID][txs[ChanEntryID].length-1].nonce++
      }

      let tx = {
        agreement: agreement.ID,
        channel: channel.ID,
        nonce: tx_nonce,
        timestamp: Date.now(),
        data: updateState,
        txHash: self.web3.sha3(updateState.toString(), {encoding: 'hex'})
      }
      txs[ChanEntryID].push(tx)

      // store the channel
      Object.assign(channels[ChanEntryID], updateChannel)
      await self.storage.set('channels', channels)

      // store the new agreement
      Object.assign(agreements[AgreeEntryID], updateAgreement)
      await self.storage.set('agreements', agreements)

      // store state
      await self.storage.set('states', rawStates)
      await self.storage.set('transactions', txs)

    },

    _verifyUpdate: function(updateAgreement, currentAgreement, currentChannel, updateState) {
      // get old channel hash
      let oldStateHash = self.utils.sha3(currentChannel.stateSerialized, {encoding: 'hex'})

      // TODO: create modules for each interpreter type
      if(currentChannel.type == 'ether') {
        currentChannel.stateRaw[2]++
        currentChannel.stateRaw[11] = updateState.balanceA
        currentChannel.stateRaw[12] = updateState.balanceB
      }

      let newStateSerialized = self.utils.serializeState(currentChannel.stateRaw)

      // calculate channel root hash
      let elem = self.utils.sha3(newStateSerialized, {encoding: 'hex'})

      let elems = currentAgreement.channels.slice(0)
 
      for(var i=0; i<currentAgreement.channels.length; i++) { 
        if(oldStateHash === elems[i]) {
          elems[i] = elem
        }
        elems[i] = self.utils.hexToBuffer(elems[i])
      }

      let merkle = new self.merkleTree(elems)

      // put root hash in agreement state
      let channelRoot = self.utils.bufferToHex(merkle.getRoot())

      if(updateAgreement.channelRootHash === channelRoot) {
        return true
      } else {
        return false
      }

    },

    closeChannel: async function(channelID) {

    },

    confirmCloseChannel: async function(channelID) {

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

    getAllAgreements: async function() {
      let _agreements = await self.storage.get('agreements')
      return _agreements
    },

    getAllChannels: async function() {
      let _channels = await self.storage.get('channels')
      return _channels
    },

    getAllTransactions: async function() {
      let _txs = await self.storage.get('transactions')
      return _txs
    },

    getAllRawStates: async function() {
      let _raw = await self.storage.get('states')
      return _raw
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

    getHTLCs: async function(ID) {
      let _hashlockedTxs = await self.storage.get('htlcs')
      return _hashlockedTxs[ID]
    },


    syncDatabase: async function(agreement) {

    },

    clearStorage: async function() {
      await self.storage.set('agreements', {})
      await self.storage.set('transactions', {})
      await self.storage.set('states', {})
      await self.storage.set('channels', {})
    }
  }
}
