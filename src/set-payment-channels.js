'use strict'

const LC = require('../contracts/LedgerChannel.json')
const EC = require('../contracts/ECTools.json')
const BigNumber = require('bignumber.js')

module.exports = function setPayment (self) {
  return {
    init: async function(options) {
      // TODO: Check against counterfactual registry and see if any
      // of the channels are being challenged when online
      self.ledgerAddress = '0x31f5575c564c36f2b85b8dbbdc7112e6b078b89d'
      self.abi = LC.abi

    },

    createLC: async function(options) {

      const _id = self.utils.getNewChannelId()

      let raw_lcS0 = {
        isClosed: false,
        nonce: '0',
        numOpenVC: '0',
        rootHash: '0x0',
        partyA: options.partyA,
        partyI: options.partyI,
        balanceA: options.balanceA,
        balanceI: options.balanceI
      }

      const _state = await self.utils.createLCStateUpdate(raw_lcS0)
      const _sig = await self.utils.signState(_state)

      const lcS0 = {
        id: _id,
        isClosed: false,
        nonce: '0',
        numOpenVC: '0',
        rootHash: '0x0',
        partyA: options.partyA,
        partyI: options.partyI,
        balanceA: options.balanceA,
        balanceI: options.balanceI,
        stateHash: _state,
        sig: _sig
      }

      //console.log(self.utils.bufferToHex(self.utils.ecrecover(_state, _sig.v, _sig.r, _sig.s)))

      //TODO: contact hub with lcS0, wait for signature response

      await self.storage.storeLC(lcS0)

      let tx_receipt = await self.utils.createLCHandler(lcS0)

      await self.utils.testLC()

      return _id
    },

    // TODO: Replace agreement with just the state sig from counterparty
    joinLC: async function(lc) {
      //TODO: verify format of lc 
      let raw_lcS0 = {
        isClosed: lc.isClosed,
        nonce: lc.nonce,
        numOpenVC: lc.numOpenVC,
        rootHash: lc.rootHash,
        partyA: lc.partyA,
        partyI: lc.partyI,
        balanceA: lc.balanceA,
        balanceI: lc.balanceI
      }

      const _state = await self.utils.createLCStateUpdate(raw_lcS0)
      const _sig = await self.utils.signState(_state)

      lc.sig_counterparty = _sig
      await self.storage.storeLC(lc)

      //todo send sig to alice

      let tx_receipt = await self.utils.joinLCHandler(lc)

      return lc.id
    },


    updateLC: async function(lc) {
      let oldState = await this.getLC(lc.id)
      
      // todo state update validation


    },


    initiateCloseChannel: async function(agreementID) {

    },

    confirmCloseChannel: async function(agreement, state) {

    },

    finalizeChannel: async function(agreementID) {

    },

    // channel functions

    openVC: async function(options) {

    },

    // TODO: replace agreement param with signature
    // you must respond to any request before updating any other state (everything pulls from latest)
    joinVC: async function(channel, agreement, channelState) {


    },

    // When Ingrid receives both agreements
    hubConfirmVC: async function(channelA, channelB, agreementA, agreementB, channelState) {

    },

    // TODO: before updating any channel state we should check that the channel
    // is not closed. Check previous channel state for close flag
    initiateUpdateVCState: async function(id, updateState) {

    },


    confirmVCUpdate: async function(updateVC, updateState) {

    },

    isVCOpen: async function(agreementID) {


    },

    startSettleLC: async function(channelID) {

    },

    challengeSettleLC: async function(channelID) {
      // TODO: call challengeSettle on metachannel
    },

    // Byzantine functions

    startSettleVC: async function(agreementID) {
      // Require that there are no open channels!

      // TODO: instantiate metachannel, call startSettle
    },

    challengeSettleVC: async function(agreementID) {
      // TODO: call challengeSettle on metachannel
    },

    closeByzantineVC: async function(agreementID) {
      // TODO: call msig closeWithMetachannel

    },


    closeByzantineLC: async function(channelID) {

    },

    _verifyUpdate: function(updateAgreement, currentAgreement, currentChannel, updateState) {

    },

    getLC: async function(id) {
      let lc = await self.storage.getLC(id)
      return lc
    },

    getAllLCs: async function() {

    },

    getAllVCs: async function() {

    },

    getAllTransactions: async function() {

    },

    getAllRawStates: async function() {

    },

    getVC: async function(channelID) {

    },

    getTransaction: async function(agreementID) {

    },

    getState: async function(ID) {

    },

    updateLCSigsDB: async function(channel) {

    },

    syncDatabase: async function(agreement) {

    },

    clearStorage: async function() {
      await self.storage.set('agreements', {})
      await self.storage.set('transactions', {})
      await self.storage.set('states', {})
      await self.storage.set('channels', {})
      await self.storage.set('virtuals', {})
    }
  }
}
