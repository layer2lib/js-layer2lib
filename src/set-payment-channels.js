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

      // const hash = self.web3.utils.soliditySha3(
      //   { type: 'bool', value: state.isClose }, // isclose
      //   //{ type: 'bytes32', value: web3.sha3('lc2', {encoding: 'hex'}) }, // lcid
      //   { type: 'uint256', value: state.nonce }, // sequence
      //   { type: 'uint256', value: state.numOpenVC }, // open VCs
      //   { type: 'bytes32', value: state.rootHash }, // VC root hash
      //   { type: 'address', value: state.partyA }, // partyA
      //   { type: 'address', value: state.partyI }, // hub
      //   { type: 'uint256', value: web3latest.utils.toWei(state.balanceA) },
      //   { type: 'uint256', value: web3latest.utils.toWei(state.balan) }
      // ) 

      let lcS0 = {
        isClose: true,
        nonce: 0,
        numOpenVC: 0,
        rootHash: '0x0',
        partyA: options.partyA,
        partyI: options.partyI,
        balanceA: options.balanceA,
        balanceI: options.balanceI
      }

      await self.utils.testLC()
      return
    },

    // TODO: Replace agreement with just the state sig from counterparty
    joinLC: async function() {

    },


    updateLC: async function(channel) {

    },


    initiateCloseChannel: async function(agreementID) {

    },

    confirmCloseChannel: async function(agreement, state) {

    },

    finalizeChannel: async function(agreementID) {

    },

    // channel functions

    // IF battle eth channel
    // Alice creates channel agreement for Bob with Ingrid
    // Bob confirms and creates agreement for Alice with Ingrid
    openVC: async function(channel) {

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

    getLC: async function(agreementID) {
      return 
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
