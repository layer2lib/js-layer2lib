const Buffer = require('buffer').Buffer
const ethutil = require('ethereumjs-util')
const TX = require('ethereumjs-tx')
const BigNumber = require('bignumber.js')
const crypto = require('crypto')

module.exports = function(self) {
  return {
    latestTime: function latestTime() {
      return self.web3.eth.getBlock('latest').timestamp
    },

    recoverSigner: function recoverSigner(state, sig) {
      const pubkey = ethutil.ecrecover(state, sig.v, sig.r, sig.s)
      const addrBuf = ethutil.pubToAddress(pubkey)
      return this.bufferToHex(addrBuf)
    },

    signState: function signState(state) {
      // TODO: deal with the protocol this uses to hash and sign...
      return self.web3.eth.accounts.sign(state, self.privateKey)
    },

    deployContract: async function deployContract(bytes, signer) {
      const gas = await self.web3.eth.getGasPrice()

      // TODO: get use public key of private key to generate account
      const nonce = await self.web3.eth.getTransactionCount(signer)

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(4612388),
        data: bytes,
        from: signer
      }

      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0xff0b70a7210b8c70a3d0dc9eb33144d308cce763fdcc10d4f836022f20e03d22'
      await this.waitForConfirm(txHash)
      let receipt = await self.web3.eth.getTransactionReceipt(txHash.transactionHash)
      let contract_address = receipt.contractAddress

      return contract_address
      //return '0x213c5c4a205fa2ca5833befd0fa34b2f5cb64c8f'
    },

    // SET-PAYMENT HELPERS

    createLCStateUpdate: async function createLCStateUpdate(state) {
    // generate state update to sign
      const hash = self.web3.utils.soliditySha3(
        { type: 'bool', value: state.isClose }, // isclose
        //{ type: 'bytes32', value: web3.sha3('lc2', {encoding: 'hex'}) }, // lcid
        { type: 'uint256', value: state.nonce }, // sequence
        { type: 'uint256', value: state.numOpenVC }, // open VCs
        { type: 'bytes32', value: state.rootHash }, // VC root hash
        { type: 'address', value: state.partyA }, // partyA
        { type: 'address', value: state.partyI }, // hub
        { type: 'uint256', value: self.web3.utils.toWei(state.balanceA) },
        { type: 'uint256', value: self.web3.utils.toWei(state.balanceI) }
      ) 

      return hash
    },

    createVCStateUpdate: async function createVCStateUpdate(state) {
    // generate state update to sign
      const hash = self.web3.utils.soliditySha3(
        { type: 'bytes32', value: state.channelId },
        { type: 'uint256', value: state.nonce },
        { type: 'address', value: state.partyA },
        { type: 'address', value: state.partyB },
        { type: 'uint256', value: state.hubBond },
        { type: 'uint256', value: self.web3.utils.toWei(state.balanceA) },
        { type: 'uint256', value: self.web3.utils.toWei(state.balanceB) }
      )

      return hash
    },

    testLC: async function testLC() {
      //console.log(contractABI)
      var newContract = new self.web3.eth.Contract(self.abi, self.ledgerAddress)
      //var contractInstance = newContract.at(address)
      //let c = new self.web3.eth.Contract(contractABI, address)
      let name = await newContract.methods.NAME().call()
      let ver = await newContract.methods.VERSION().call()
      let numChan = await newContract.methods.numChannels().call()
      console.log(name)
      console.log(ver)
      console.log(numChan)
      return
    },

    createLCHandler: async function createLCHandler(state) {
      var lc = new self.web3.eth.Contract(self.abi, self.ledgerAddress)

      const callData = lc.methods.createChannel(state.id, state.partyI, '0').encodeABI()
      let gas = await self.web3.eth.getGasPrice()
      const nonce = await self.web3.eth.getTransactionCount(state.partyA)

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(250000),
        to: self.ledgerAddress,
        value: await self.web3.utils.numberToHex(self.web3.utils.toWei(state.balanceA)),
        data: callData,
        from: state.partyA
      }

      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0x467ea0c77c8edfdaee53f40570d7ac7f57461c044c6b3b7f87658bad3f062dd6'
      await this.waitForConfirm({transactionHash:txHash})
      //await this.waitForConfirm(txHash)
      return txHash
    },

    joinLCHandler: async function createLCHandler(state) {
      var lc = new self.web3.eth.Contract(self.abi, self.ledgerAddress)

      const callData = lc.methods.joinChannel(state.id).encodeABI()
      let gas = await self.web3.eth.getGasPrice()
      const nonce = await self.web3.eth.getTransactionCount(state.partyI)

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(250000),
        to: self.ledgerAddress,
        value: await self.web3.utils.numberToHex(self.web3.utils.toWei(state.balanceI)),
        data: callData,
        from: state.partyI
      }

      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0x467ea0c77c8edfdaee53f40570d7ac7f57461c044c6b3b7f87658bad3f062dd6'
      await this.waitForConfirm({transactionHash:txHash})
      //await this.waitForConfirm(txHash)
      return txHash
    },


    // OLD GSC HELPERS

    // TODO: combine open and join agreement function to executeAgreement.
    // this will just require swaping the method sig
    executeOpenAgreement: async function executeOpenAgreement(
      contractABI,
      address,
      state,
      extension,
      sig,
      balA,
      signer
    ) {

      // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
      let c = new self.web3.eth.Contract(contractABI, address)
      let r = sig[0]
      let s = sig[1]
      let v = sig[2]
      let callData = c.methods.openAgreement(state, extension, v, r, s).encodeABI()

      let gas = await self.web3.eth.getGasPrice()
      //gas+=2000000000

      // TODO: get use public key of private key to generate account
      const nonce = await self.web3.eth.getTransactionCount(signer)

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(250000),
        to: address,
        value: await self.web3.utils.toHex(balA),
        data: callData,
        from: signer
      }

      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0xff0b70a7210b8c70a3d0dc9eb33144d308cce763fdcc10d4f836022f20e03d22'
      await this.waitForConfirm(txHash)
      return txHash
    },

    executeJoinAgreement: async function executeJoinAgreement(
      contractABI,
      address,
      state,
      extension,
      sig,
      balB,
      signer
    ) {
      // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
      let c = new self.web3.eth.Contract(contractABI, address)
      let r = sig[0]
      let s = sig[1]
      let v = sig[2]
      let callData = c.methods.joinAgreement(state, extension, v, r, s).encodeABI()

      let gas = await self.web3.eth.getGasPrice()

      const nonce = await self.web3.eth.getTransactionCount(signer)

      //gas+=2000000000

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(250000),
        to: address,
        value: await self.web3.utils.toHex(balB),
        data: callData,
        from: signer
      }

      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0x8d470165aa3cee1f5d6e927b90d20a59a14318964fa67846a230535443b83f07'
      await this.waitForConfirm(txHash)
      return txHash
    },

    executeCloseAgreement: async function executeCloseAgreement(
      contractABI,
      address,
      state,
      sigs,
      signer
    ) {
      // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
      let c = new self.web3.eth.Contract(contractABI, address)

      let r = sigs[0][0]
      let s = sigs[0][1]
      let v = sigs[0][2]
      let r2 = sigs[1][0]
      let s2 = sigs[1][1]
      let v2 = sigs[1][2]

      let sigV = []
      let sigR = []
      let sigS = []

      sigV.push(v)
      sigV.push(v2)
      sigR.push(r)
      sigR.push(r2)
      sigS.push(s)
      sigS.push(s2)

      let callData = c.methods.closeAgreement(state, sigV, sigR, sigS).encodeABI()


      let gas = await self.web3.eth.getGasPrice()

      const nonce = await self.web3.eth.getTransactionCount(signer)

      //gas+=2000000000

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(250000),
        to: address,
        data: callData,
        from: signer
      }


      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0x8d470165aa3cee1f5d6e927b90d20a59a14318964fa67846a230535443b83f07'
      await this.waitForConfirm(txHash)
      return txHash
    },

    executeDeployCTF: async function executeDeployCTF(
      contractABI, // registry abi
      address, // registry address
      state,
      sigs,
      signer,
      metaCTF
    ) {
      let c = new self.web3.eth.Contract(contractABI, address)

      let r = sigs[0][0]
      let s = sigs[0][1]
      let v = sigs[0][2]
      let r2 = sigs[1][0]
      let s2 = sigs[1][1]
      let v2 = sigs[1][2]

      let sigV = []
      let sigR = []
      let sigS = []

      sigV.push(v)
      sigV.push(v2)
      sigR.push(r)
      sigR.push(r2)
      sigS.push(s)
      sigS.push(s2)

      let callData = c.methods.deployCTF(state, sigV, sigR, sigS).encodeABI()


      let gas = await self.web3.eth.getGasPrice()

      const nonce = await self.web3.eth.getTransactionCount(signer)

      //gas+=2000000000

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(6500000),
        to: address,
        data: callData,
        from: signer
      }


      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0x0'
      await this.waitForConfirm(txHash)
      let metaDeployed = await c.methods.resolveAddress(metaCTF).call()
      //let metaDeployed = '0x69d374647049341aa74f2216434fe2d0715546b4'
      console.log(metaDeployed)
      return metaDeployed
    },

    executeSettleChannel: async function executeSettleChannel(
      contractABI, // metachan abi
      address, // metachan address
      chanState,
      agreeState,
      sigs,
      signer,
      channels
    ) {
      let c = new self.web3.eth.Contract(contractABI, address)

      let elems = []
      for(var i=0; i<channels.length; i++) { elems.push(this.hexToBuffer(channels[i])) }

      let merkle = new self.merkleTree(elems)

      // put root hash in agreement state
      let channelRoot = this.bufferToHex(merkle.getRoot())
      let chanStateHash = self.web3.utils.sha3(chanState, {encoding: 'hex'})
      let proof = merkle.proof(this.hexToBuffer(chanStateHash))

      if(proof.length === 0) {
        proof = [channelRoot]
      }
      proof = this.serializeState(proof)

      console.log(proof)

      let r = sigs[0][0]
      let s = sigs[0][1]
      let v = sigs[0][2]
      let r2 = sigs[1][0]
      let s2 = sigs[1][1]
      let v2 = sigs[1][2]

      let sigV = []
      let sigR = []
      let sigS = []

      sigV.push(v)
      sigV.push(v2)
      sigR.push(r)
      sigR.push(r2)
      sigS.push(s)
      sigS.push(s2)

      let callData = c.methods.startSettleStateSubchannel(proof, agreeState, chanState, sigV, sigR, sigS).encodeABI()

      let gas = await self.web3.eth.getGasPrice()
      // avoid out of gas error
      // running into issues here -Lex
      //gas = BigNumber('20000000000')

      const nonce = await self.web3.eth.getTransactionCount(signer)

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(2000000),
        to: address,
        data: callData,
        from: signer
      }


      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0x34c11641854beb1c01af69aeaf1057ee3e275ead8057eda8a7d5d3260850d24e'
      await this.waitForConfirm(txHash)
      // TODO remove hardcoded ID :(
      let subchannel = await c.methdos.getSubChannel(this.serializeState(['channelId'])).call()
      console.log(subchannel)
      return txHash

    },

    executeCloseChannel: async function executeCloseChannel(contractABI, address, chanID, signer) {
      let c = new self.web3.eth.Contract(contractABI, address)

      let callData = c.methods.closeSubchannel(this.serializeState([chanID])).encodeABI()

      let gas = await self.web3.eth.getGasPrice()

      const nonce = await self.web3.eth.getTransactionCount(signer)

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(2000000),
        to: address,
        data: callData,
        from: signer
      }


      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0x34c11641854beb1c01af69aeaf1057ee3e275ead8057eda8a7d5d3260850d24e'
      await this.waitForConfirm(txHash)
      return txHash

    },

    executeFinalizeCloseChannel: async function executeFinalizeCloseChannel(contractABI, address, chanID, signer) {
      let c = new self.web3.eth.Contract(contractABI, address)

      let callData = c.methods.closeWithTimeoutSubchannel(this.serializeState([chanID])).encodeABI()

      let gas = await self.web3.eth.getGasPrice()

      const nonce = await self.web3.eth.getTransactionCount(signer)

      const rawTx = {
        nonce: await self.web3.utils.toHex(nonce),
        gasPrice: await self.web3.utils.toHex(gas),
        gasLimit: await self.web3.utils.toHex(2000000),
        to: address,
        data: callData,
        from: signer
      }


      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendSignedTransaction(this.bufferToHex(serialized))
      let txHash = '0x34c11641854beb1c01af69aeaf1057ee3e275ead8057eda8a7d5d3260850d24e'
      await this.waitForConfirm(txHash)
      return txHash

    },

    waitForConfirm: async function(txHash) {
      console.log('waiting for '+txHash.transactionHash+' to be confirmed...')
      let receipt = await self.web3.eth.getTransactionReceipt(txHash.transactionHash)

      if(receipt == null) {
        await this.timeout(1000)
        await this.waitForConfirm(txHash)
      } else {
        return
      }
    },

    timeout: function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },

    getBytes: function getBytes(input) {
      if(Buffer.isBuffer(input)) input = '0x' + input.toString('hex')
      if(66-input.length <= 0) return self.web3.utils.toHex(input)
      return this.padBytes32(self.web3.utils.toHex(input))
    },

    sha3: function sha3(input) {
      return self.web3.utils.sha3(input, {encoding: 'hex'})
    },

    sign: function sign(message, key) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      let msg = this.hexToBuffer(message)
      let msgHash = ethutil.hashPersonalMessage(msg)
      return ethutil.ecsign(msgHash, this.hexToBuffer(key))
    },

    importPublic: function importPublic(key) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      return ethutil.importPublic(this.hexToBuffer(key))
    },

    ecrecover: function ecrecover(message, v, r, s) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      return ethutil.ecrecover(this.hexToBuffer(message), v, r, s)
    },

    privateToPublic: function privateToPublic(key) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      return ethutil.privateToPublic(this.hexToBuffer(key))
    },

    pubToAddress: function pubToAddress(key) {
      // TODO, web3 1.0.0 has a method for this but
      // is not stable yet
      return ethutil.pubToAddress(this.hexToBuffer(key))
    },

    serializeState: function serializeState(inputs) {
      var m = this.getBytes(inputs[0])

      for(var i=1; i<inputs.length;i++) {
        let x = this.getBytes(inputs[i])
        m += x.substr(2, x.length)
      }
      return m
    },

    getCTFaddress: function getCTFaddress(_r) {
      return self.web3.utils.sha3(_r, {encoding: 'hex'})
    },

    getCTFstate: function getCTFstate(_contract, _signers, _args) {
      _args.unshift(_contract)
      var _m = this.serializeState(_args)
      _signers.push(_contract.length)
      _signers.push(_m)
      var _r = this.serializeState(_signers)
      return _r
    },

    padBytes32: function padBytes32(data){
      // TODO: check input is hex / move to TS
      let l = 66-data.length

      let x = data.substr(2, data.length)

      for(var i=0; i<l; i++) {
        x = 0 + x
      }
      return '0x' + x
    },

    rightPadBytes32: function rightPadBytes32(data){
      let l = 66-data.length

      for(var i=0; i<l; i++) {
        data+=0
      }
      return data
    },

    hexToBuffer: function hexToBuffer(hexString) {
      return new Buffer(hexString.substr(2, hexString.length), 'hex')
    },

    bufferToHex: function bufferToHex(buffer) {
      return '0x'+ buffer.toString('hex')
    },

    getNewChannelId: function getNewChannelId () {
      const buf = crypto.randomBytes(32)
      const channelId = this.bufferToHex(buf)
      return channelId
    }
  }
}