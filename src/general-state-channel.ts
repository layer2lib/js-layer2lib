//import * as metachannel from "../contracts/general-state-channels/build/contracts/MetaChannel.json";

export default function gsc(self: any) {
  return {
    get: async function() {
      //console.log(this._getMetaChannelBytecode())
    },
    set: async function() {},
    _getMetaChannelBytecode: function(): any {
      return "";
      //return metachannel.deployedBytecode;
    }
  };
}
