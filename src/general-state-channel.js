'use strict'

const metachannel = require('../contracts/general-state-channels/build/contracts/MetaChannel.json')
const repo = require('./repo/repo-node')

module.exports = function gsc (self) {
  return {
    init: async function(options) {
      //console.log(this._getMetaChannelBytecode())
      self.storage = repo(this)

      

    },
    openAgreement: async function(options) {
      let agreement = {}
      agreement.ID = options.ID
      agreement.partyA = options.partyA
      agreement.partyB = options.partyB
      agreement.type = options.type // the bond type, ie ether, token, object

      self.storage.set(agreement.ID, agreement)

    },
    findAllAgreements: async function(agreements) {
      let _agreements = await self.storage.get(agreements)
      // let data = agreement.find({})
      // let readable = await data.toArray()
      // console.log(data)
      return _agreements

    },
    getSubchannel: async function(channelID) {
      let chan = self.storage.get(channelID)
      //console.log(chan)

    },
    _getMetaChannelBytecode: function() {
      return metachannel.deployedBytecode
    }
  }
}
