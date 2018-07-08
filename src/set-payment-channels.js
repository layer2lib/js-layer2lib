'use strict'

const LC = require('../contracts/LedgerChannel.json')
const EC = require('../contracts/ECTools.json')
const BigNumber = require('bignumber.js')

module.exports = function setPayment (self) {
  return {
    init: async function(options) {
      // TODO: Check against counterfactual registry and see if any
      // of the channels are being challenged when online
      self.ledgerAddress = '0x009d610444387202fec65eb056b0a7c141e4b9ed'
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
      // need lc data updated to database before just id will work
      //let lc = await this.getLC(id)
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

    refundOpenLC: async function(lc_id) {

    },


    updateLC: async function(lc) {
      let oldState = await this.getLC(lc.id)
      
      // console.log(oldState)
      // todo state update validation


    },


    initiateCloseLC: async function(lc) {
      // todo call consensus close with double signed close state
      let oldState = await this.getLC(lc.id)
      // todo: verify latest known lc state from db doesn't have open vc on it

      let _nonce = parseInt(oldState.nonce, 10)
      _nonce = _nonce+1

      let raw_lcS = {
        isClosed: true,
        nonce: _nonce,
        numOpenVC: '0',
        rootHash: '0x0',
        partyA: oldState.partyA,
        partyI: oldState.partyI,
        balanceA: lc.balanceA,
        balanceI: lc.balanceI
      }

      const _state = await self.utils.createLCStateUpdate(raw_lcS)
      const _sig = await self.utils.signState(_state)

      let lcS =  raw_lcS
      lcS.stateHash = _state
      lcS.sig = _sig
      lcS.id = lc.id

      // contact hub message node
      await self.storage.updateLC(lcS)

    },

    confirmCloseLC: async function(lc_id) {
      let oldState = await this.getLC(lc_id)
      //console.log(oldState)
      // todo state update validation


    },

    consensusCloseLC: async function(lc) {


    },

    // channel functions

    openVC: async function(options) {
      let lcState = await this.getLC(options.lcid)
      //console.log(lcState)
    },

    // TODO: replace agreement param with signature
    // you must respond to any request before updating any other state (everything pulls from latest)
    joinVC: async function(vc) {


    },

    // When Ingrid receives both agreements
    hubConfirmVC: async function(lcid_A, lcid_B, vc_id) {

    },

    // TODO: before updating any channel state we should check that the channel
    // is not closed. Check previous channel state for close flag
    updateVCState: async function(id, updateState) {

    },

    isVCOpen: async function(agreementID) {


    },

    closeVC: async function(vc_id) {

    },
    // Byzantine functions

    startSettleLC: async function(channelID) {

    },

    challengeSettleLC: async function(channelID) {
      // TODO: call challengeSettle on metachannel
    },


    startSettleVC: async function(agreementID) {

    },

    challengeSettleVC: async function(agreementID) {

    },

    closeByzantineVC: async function(agreementID) {


    },


    closeByzantineLC: async function(channelID) {

    },

    _verifyUpdate: function(updateAgreement, currentAgreement, currentChannel, updateState) {

    },

    // DB helpers

    getLC: async function(id) {
      let lc = await self.storage.getLC(id)
      return lc
    },

    getVC: async function(id) {
      let vc = await self.storage.getVChannel(id)
      return vc
    },

    getAllLCs: async function() {

    },

    getAllVCs: async function() {

    },

    getAllTransactions: async function() {

    },

    getVC: async function(channelID) {

    },

    getTransaction: async function(agreementID) {

    },

    syncDatabase: async function(agreement) {

    }
  }
}
