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
