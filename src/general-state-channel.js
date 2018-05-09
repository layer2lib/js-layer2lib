'use strict'

const metachannel = require('../contracts/general-state-channels/build/contracts/MetaChannel.json')

module.exports = function gsc (self) {
  return {
    get: async function() {
      //console.log(this._getMetaChannelBytecode())
    },
    set: async function() {

    },
    _getMetaChannelBytecode: function() {
      return metachannel.deployedBytecode
    }
  }
}
