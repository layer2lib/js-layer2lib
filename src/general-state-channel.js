'use strict'

const metachannel = require('../contracts/general-state-channels/build/contracts/MetaChannel.json')
const msig = require('../contracts/general-state-channels/build/contracts/MultiSig.json')
const reg = require('../contracts/general-state-channels/build/contracts/CTFRegistry.json')
const BigNumber = require('bignumber.js')

module.exports = function gsc (self) {
  return {
    init: async function(options) {
      // TODO: Check against counterfactual registry and see if any
      // of the channels are being challenged when online
      self.etherExtension = '0x32c1d681fe917170573aed0671d21317f14219fd'
      self.bidirectEtherInterpreter = '0x74926af30d35337e45225666bbf49e156fd08016'
      self.battleEtherInterpreter = '0x0'
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
      agreement.closed = false
      agreement.inDispute = false
      agreement.metaSignatures = []
      agreement.channels = []
      agreement.channelRootHash = '0x0'

      const metaByteCode = metachannel.bytecode

      let args = ['test42042', agreement.partyA, agreement.partyB]
      let signers = [agreement.partyA, agreement.partyB]
      let metaCTFbytes = self.utils.getCTFstate(metaByteCode, signers, args)
      let metachannelCTFaddress = self.utils.getCTFaddress(metaCTFbytes)
      //let metachannelCTFaddress = '1337'

      rawStates[metachannelCTFaddress] = metaCTFbytes

      agreement.metachannelCTFaddress = metachannelCTFaddress
      let metaSig = self.utils.sign(agreement.metachannelCTFaddress, self.privateKey)
      let mr = self.utils.bufferToHex(metaSig.r)
      let ms = self.utils.bufferToHex(metaSig.s)
      let mv = metaSig.v
      let msigs = [[mr,ms,mv]]

      agreement.metaSignatures = msigs


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
      let state0sig = self.utils.sign(stateHash, self.privateKey)

      let r = self.utils.bufferToHex(state0sig.r)
      let s = self.utils.bufferToHex(state0sig.s)
      let v = state0sig.v
      let sigs = [[r,s,v]]

      agreement.stateSignatures = []
      agreement.stateSignatures[0] = sigs


      // TODO deploy and call openAgreement on msig wallet
      // save msig deploy address to agreement object
      const msigBytecode = msig.bytecode
      let msigArgs = [msigBytecode, metachannelCTFaddress, self.registryAddress]
      let msigDeployBytes = self.utils.serializeState(msigArgs)
      let msigAddress = await self.utils.deployContract(msigDeployBytes, agreement.partyA)
      //let msigAddress = msig_tx_hash
      agreement.address = msigAddress

      // TODO: call deployed msig
      let openTxHash = await self.utils.executeOpenAgreement(
        msig.abi, 
        msigAddress, 
        agreement.stateSerialized, 
        self.etherExtension, 
        sigs[0], 
        agreement.balanceA,
        agreement.partyA
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


      self.publicKey = self.utils.bufferToHex(self.utils.ecrecover(stateHash, state0sig.v, state0sig.r, state0sig.s))
      
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
      let sig = self.utils.sign(stateHash, self.privateKey)
      let r = self.utils.bufferToHex(sig.r)
      let s = self.utils.bufferToHex(sig.s)
      let v = sig.v
      let sigs = [r,s,v]

      let metaSig = self.utils.sign(agreement.metachannelCTFaddress, self.privateKey)
      let mr = self.utils.bufferToHex(metaSig.r)
      let ms = self.utils.bufferToHex(metaSig.s)
      let mv = metaSig.v
      let msigs = [mr,ms,mv]

      agreement.metaSignatures.push(msigs)
      agreement.stateSignatures[0].push(sigs)
      agreement.openPending = false;

      self.publicKey = self.utils.bufferToHex(
        self.utils.ecrecover(
          stateHash, 
          sig.v, 
          sig.r, 
          sig.s
          )
        )

      let joinTxHash = await self.utils.executeJoinAgreement(
        msig.abi, 
        agreement.address, 
        agreement.stateSerialized, 
        self.etherExtension, 
        agreement.stateSignatures[0][1], 
        agreement.balanceB,
        agreement.partyB
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

      console.log('Agreement Sigs updated in db')
    },

    updateChannelSigs: async function(channel) {
      let entryID = channel.ID+channel.dbSalt
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(entryID)) return

      Object.assign(channels[entryID], channel)

      await self.storage.set('channels', channel)

      console.log('Channel Sigs updated in db')
    },

    initiateCloseAgreement: async function(agreementID) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreementID)) return

      let txs = await self.storage.get('transactions') || {}
      if(!txs.hasOwnProperty(agreementID)) return

      let rawStates = await self.storage.get('states') || {}
      if(!rawStates.hasOwnProperty(agreementID)) return

      let agreement = agreements[agreementID]
      agreement.closed = true
      const stateLength = rawStates[agreementID].length-1

      let oldState = JSON.parse(JSON.stringify(rawStates[agreementID][stateLength]))

      oldState[0] = 1
      oldState[1] = oldState[1] + 1
      
      rawStates[agreementID].push(oldState)
      agreement.stateSerialized = self.utils.serializeState(oldState)

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})

      let sig = self.utils.sign(stateHash, self.privateKey)
      let r = self.utils.bufferToHex(sig.r)
      let s = self.utils.bufferToHex(sig.s)
      let v = sig.v
      let sigs = [[r,s,v]]

      agreement.stateSignatures[agreement.stateSignatures.length] = sigs

      let tx = {
        agreement: agreement.ID,
        channel: 'master',
        nonce: oldState[1],
        timestamp: Date.now(),
        data: 'close Agreement',
        txHash: '0x0'
      }
      txs[agreementID].push(tx)

      Object.assign(agreements[agreementID], agreement)
      // Object.assign(txs[entryID], txList)
      // Object.assign(rawStates[entryID], rawStatesList)

      await self.storage.set('agreements', agreements)
      await self.storage.set('transactions', txs)
      await self.storage.set('states', rawStates)
    },

    confirmCloseAgreement: async function(agreement, state) {
      let agreementID = agreement.ID+agreement.dbSalt   
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreementID)) return

      let txs = await self.storage.get('transactions') || {}
      if(!txs.hasOwnProperty(agreementID)) return

      let rawStates = await self.storage.get('states') || {}
      if(!rawStates.hasOwnProperty(agreementID)) return
      
      rawStates[agreementID].push(state[state.length-1])

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      let sig = self.utils.sign(stateHash, self.privateKey)
      let r = self.utils.bufferToHex(sig.r)
      let s = self.utils.bufferToHex(sig.s)
      let v = sig.v
      let sigs = [r,s,v]

      agreement.stateSignatures[agreement.stateSignatures.length-1].push(sigs) 

      let tx = {
        agreement: agreement.ID,
        channel: 'master',
        nonce: '99',
        timestamp: Date.now(),
        data: 'close Agreement',
        txHash: '0x0'
      }
      txs[agreementID].push(tx)

      Object.assign(agreements[agreementID], agreement)
      // Object.assign(txs[entryID], txList)
      // Object.assign(rawStates[entryID], rawStatesList)

      await self.storage.set('agreements', agreements)
      await self.storage.set('transactions', txs)
      await self.storage.set('states', rawStates)
    },

    finalizeAgreement: async function(agreementID) {
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(agreementID)) return

      let agreement = agreements[agreementID]

      let finalTxHash = await self.utils.executeCloseAgreement(
        msig.abi, 
        agreement.address, 
        agreement.stateSerialized, 
        agreement.stateSignatures[agreement.stateSignatures.length-1],
        agreement.partyB // TODO: dont assume which party is calling this, it may be neither
      )


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

    // When Ingrid receives both agreements 
    hubConfirmVC: async function(channelA, channelB, agreementA, agreementB, channelState) {

    },

    // IF battle eth channel
    // Alice creates channel agreement for Bob with Ingrid
    // Bob confirms and creates agreement for Alice with Ingrid
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

      if(channel.type == 'battle_ether') {
        channelInputs.push(0) // is close
        channelInputs.push(1) // is force push channel
        channelInputs.push(0) // channel sequence
        channelInputs.push(0) // timeout length ms
        channelInputs.push(self.battleEtherInterpreter) // ether payment interpreter library address
        channelInputs.push(channel.ID) // ID of channel
        channelInputs.push(agreement.metachannelCTFaddress) // counterfactual metachannel address
        channelInputs.push(self.registryAddress) // CTF registry address
        channelInputs.push('0x0') // channel tx roothash
        channelInputs.push(agreement.partyA) // partyA in the channel
        channelInputs.push(channel.partyB) // partyB in the channel
        channelInputs.push(agreement.partyB) // partyI in the channel

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

      let sig = self.utils.sign(stateHash, self.privateKey)
      let r = self.utils.bufferToHex(sig.r)
      let s = self.utils.bufferToHex(sig.s)
      let v = sig.v
      let sigs = [[r,s,v]]

      agreement.stateSignatures[agreement.stateSignatures.length] = sigs

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
    // you must respond to any request before updating any other state (everything pulls from latest)
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

      // grab latest state and modify it
      let newState = JSON.parse(JSON.stringify(oldStates[oldStates.length-1]))

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

      // push the new sig of new state into agreement object
      rawStates[AgreeEntryID].push(newState)

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
      let sig = self.utils.sign(stateHash, self.privateKey)
      let r = self.utils.bufferToHex(sig.r)
      let s = self.utils.bufferToHex(sig.s)
      let v = sig.v
      let sigs = [r,s,v]

      agreement.stateSignatures[agreement.stateSignatures.length-1].push(sigs)
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

    // TODO: before updating any channel state we should check that the channel
    // is not closed. Check previous channel state for close flag
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
      let oldChanStateCpy = rawStates[ChanEntryID][l-1].slice(0)

      // get old channel hash
      let oldStateHash = self.utils.sha3(channel.stateSerialized, {encoding: 'hex'})

      let l2 = rawStates[AgreeEntryID].length
      let agreementState = rawStates[AgreeEntryID][l2-1].slice(0)

      // TODO: create modules for each interpreter type
      if(channel.type == 'ether') {
        channel.balanceA = updateState.balanceA
        channel.balanceB = updateState.balanceB

        chanState[0] = updateState.isClose
        chanState[2]++
        chanState[11] = updateState.balanceA
        chanState[12] = updateState.balanceB

        //addjust agreement balance if close
        if(updateState.isClose === 1) {
          agreement.balanceA = parseInt(agreement.balanceA) + parseInt(chanState[11])
          agreement.balanceB = parseInt(agreement.balanceB) + parseInt(chanState[12])
          agreement.channelRootHash = '0x0'
          chanState[11] = 0
          chanState[12] = 0
          channel.balanceA = 0
          channel.balanceB = 0
        }
      }

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

      if(updateState.isClose === 1) {
        newState[5] = '0x0'
        newState[6] = agreement.balanceA
        newState[7] = agreement.balanceB
      }
      // push the new sig of new state into agreement object
      rawStates[AgreeEntryID].push(newState)

      agreement.stateSerialized = self.utils.serializeState(newState)

      let stateHash = self.web3.sha3(agreement.stateSerialized, {encoding: 'hex'})
      let sig = self.utils.sign(stateHash, self.privateKey)
      let r = self.utils.bufferToHex(sig.r)
      let s = self.utils.bufferToHex(sig.s)
      let v = sig.v
      let sigs = [[r,s,v]]

      agreement.stateSignatures[agreement.stateSignatures.length] = sigs

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

      rawStates[ChanEntryID].push(updateChannel.stateRaw)

      // serialize and sign s1 of agreement state
      let oldStates = rawStates[AgreeEntryID]

      // grab latest state and modify it
      let newState = JSON.parse(JSON.stringify(oldStates[oldStates.length-1]))
      newState[5] = updateAgreement.channelRootHash
      newState[1]++

      if(updateState.isClose === 1) {
        newState[5] = '0x0'
        newState[6] = updateAgreement.balanceA
        newState[7] = updateAgreement.balanceB
      }

      // add latest state
      rawStates[AgreeEntryID].push(newState)

      let stateHash = self.web3.sha3(updateAgreement.stateSerialized, {encoding: 'hex'})
      let sig = self.utils.sign(stateHash, self.privateKey)
      let r = self.utils.bufferToHex(sig.r)
      let s = self.utils.bufferToHex(sig.s)
      let v = sig.v
      let sigs = [r,s,v]

      updateAgreement.stateSignatures[updateAgreement.stateSignatures.length-1].push(sigs)

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

    startSettleChannel: async function(channelID) {
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(channelID)) return
      let channel = await this.getChannel(channelID)

      let AgreeEntryID = channel.agreementID+channel.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(AgreeEntryID)) return
      let agreement = await this.getAgreement(AgreeEntryID)

      let rawStates = await self.storage.get('states') || {}
      if(!rawStates.hasOwnProperty(channelID)) return
      if(!rawStates.hasOwnProperty(AgreeEntryID)) return

      let txs = await self.storage.get('transactions') || {}
      if(!txs.hasOwnProperty(channelID)) return

      let metaCTFaddress = agreement.metachannelCTFaddress
      let metaCTF = rawStates[metaCTFaddress]

      let sigs = agreement.metaSignatures

      let TxHash = await self.utils.executeDeployCTF(
        reg.abi, 
        self.registryAddress, 
        metaCTF, 
        sigs,
        agreement.partyB, // TODO: dont assume which party is calling this, it may be neither
        metaCTFaddress
      )

      agreement.metachannelDeployedAddress = TxHash
      agreement.inDispute = true

      let chanState = rawStates[channelID]
      let agreeState = rawStates[AgreeEntryID]

      
      let TxHash2 = await self.utils.executeSettleChannel(
        metachannel.abi,
        agreement.metachannelDeployedAddress,
        self.utils.serializeState(chanState[chanState.length-1]),
        self.utils.serializeState(agreeState[agreeState.length-1]),
        agreement.stateSignatures[agreement.stateSignatures.length-1],
        agreement.partyB,
        agreement.channels
      )

      // store the new agreement
      Object.assign(agreements[AgreeEntryID], agreement)
      await self.storage.set('agreements', agreements)
      // TODO: instantiate metachannel, call startSettle 
    },

    challengeSettleChannel: async function(channelID) {
      // TODO: call challengeSettle on metachannel
    },

    closeByzantineChannel: async function(channelID) {
      let channels = await self.storage.get('channels') || {}
      if(!channels.hasOwnProperty(channelID)) return
      let channel = await this.getChannel(channelID)

      let AgreeEntryID = channel.agreementID+channel.dbSalt
      let agreements = await self.storage.get('agreements') || {}
      if(!agreements.hasOwnProperty(AgreeEntryID)) return
      let agreement = await this.getAgreement(AgreeEntryID)

      let abi = msig.abi
      let address = agreement.address
      let tx = await self.utils.executeCloseChannel(abi, address, 'respek', agreement.partyB)
      let tx2 = await self.utils.executeCloseChannel(metachannel.abi, agreement.metachannelDeployedAddress, channelID, agreement.partyB)
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
