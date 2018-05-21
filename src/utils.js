const Buffer = require('buffer').Buffer
const ethutil = require('ethereumjs-util')
const TX = require('ethereumjs-tx')
const Promise = require('bluebird')

module.exports = function(self) {
  return {
    latestTime: function latestTime() {
      return self.web3.eth.getBlock('latest').timestamp
    },

    increaseTime: function increaseTime(duration) {
      const id = Date.now()

      return new Promise((resolve, reject) => {
        self.web3.currentProvider.sendAsync({
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [duration],
          id: id,
        }, e1 => {
          if (e1) return reject(e1)

          self.web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id+1,
          }, (e2, res) => {
            return e2 ? reject(e2) : resolve(res)
          })
        })
      })
    },

    increaseTimeTo: function increaseTimeTo(target) {
      let now = this.latestTime()
      if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`)
      let diff = target - now
      return this.increaseTime(diff)
    },

    assertThrowsAsync: async function assertThrowsAsync(fn, regExp) {
      let f = () => {};
      try {
        await fn();
      } catch(e) {
        f = () => {throw e};
      } finally {
        assert.throws(f, regExp);
      }
    },

    duration: {
      seconds: function(val) { return val},
      minutes: function(val) { return val * this.seconds(60) },
      hours:   function(val) { return val * this.minutes(60) },
      days:    function(val) { return val * this.hours(24) },
      weeks:   function(val) { return val * this.days(7) },
      years:   function(val) { return val * this.days(365)}
    },

    deployContract: async function deployContract(bytes) {
      const gas = await self.web3.eth.gasPrice

      // TODO: get use public key of private key to generate account
      const nonce = self.web3.eth.getTransactionCount(self.web3.eth.coinbase)

      const rawTx = {
        nonce: await self.web3.toHex(nonce),
        gasPrice: await self.web3.toHex(gas),
        gasLimit: await self.web3.toHex(4612388),
        data: bytes,
        from: self.web3.eth.coinbase // TODO: get account address from pubkey
      }

      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendRawTransaction(this.bufferToHex(serialized))
      let txHash = '0xff0b70a7210b8c70a3d0dc9eb33144d308cce763fdcc10d4f836022f20e03d22'
      await this.waitForConfirm(txHash)
      let receipt = await self.web3.eth.getTransactionReceipt(txHash)
      let contract_address = receipt.contractAddress
      
      return contract_address
    },


    // TODO: combine open and join agreement function to executeAgreement. 
    // this will just require swaping the method sig
    executeOpenAgreement: async function executeOpenAgreement(
      contractABI, 
      address, 
      state, 
      extension, 
      sig, 
      balA
    ) {

      // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
      let c = await self.web3.eth.contract(contractABI).at(address)
      let r = this.bufferToHex(sig.r)
      let s = this.bufferToHex(sig.s)
      let v = sig.v
      let callData = c.openAgreement.getData(state, extension, v, r, s)

      let gas = await self.web3.eth.gasPrice
      //gas+=2000000000

      // TODO: get use public key of private key to generate account
      const nonce = self.web3.eth.getTransactionCount(self.web3.eth.accounts[0])

      const rawTx = {
        nonce: await self.web3.toHex(nonce),
        gasPrice: await self.web3.toHex(gas),
        gasLimit: await self.web3.toHex(250000),
        to: address,
        value: await self.web3.toHex(balA),
        data: callData,
        from: self.web3.eth.accounts[0] // TODO: get account address from pubkey
      }

      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendRawTransaction(this.bufferToHex(serialized))
      let txHash = '0xff0b70a7210b8c70a3d0dc9eb33144d308cce763fdcc10d4f836022f20e03d22'
      return txHash
    },

    executeJoinAgreement: async function executeJoinAgreement(
      contractABI, 
      address, 
      state, 
      extension, 
      sig, 
      balB
    ) {

      // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
      let c = await self.web3.eth.contract(contractABI).at(address)
      let r = this.bufferToHex(sig.r)
      let s = this.bufferToHex(sig.s)
      let v = sig.v
      let callData = c.joinAgreement.getData(state, extension, v, r, s)

      let gas = await self.web3.eth.gasPrice

      // TODO: get use public key of private key to generate account
      const nonce = self.web3.eth.getTransactionCount(self.web3.eth.accounts[1])
      
      //gas+=2000000000

      const rawTx = {
        nonce: await self.web3.toHex(nonce),
        gasPrice: await self.web3.toHex(gas),
        gasLimit: await self.web3.toHex(250000),
        to: address,
        value: await self.web3.toHex(balB),
        data: callData,
        from: self.web3.eth.accounts[1] // TODO: get account address from pubkey
      }

      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendRawTransaction(this.bufferToHex(serialized))
      let txHash = '0x8d470165aa3cee1f5d6e927b90d20a59a14318964fa67846a230535443b83f07'
      console.log(self.web3.eth.accounts[1])
      return txHash
    },

    executeCloseAgreement: async function executeCloseAgreement(
      contractABI, 
      address, 
      state, 
      extension, 
      sigs
    ) {

      // TODO: Replace .getData with our serialization of the call inputs, just get the 4 byte method sig and serialize()
      let c = await self.web3.eth.contract(contractABI).at(address)
      let r = this.bufferToHex(sig.r)
      let s = this.bufferToHex(sig.s)
      let v = sig.v
      let callData = c.closeAgreement.getData(state, extension, v, r, s)

      let gas = await self.web3.eth.gasPrice

      // TODO: get use public key of private key to generate account
      const nonce = self.web3.eth.getTransactionCount(self.web3.eth.accounts[1])
      
      //gas+=2000000000

      const rawTx = {
        nonce: await self.web3.toHex(nonce),
        gasPrice: await self.web3.toHex(gas),
        gasLimit: await self.web3.toHex(250000),
        to: address,
        value: await self.web3.toHex(balB),
        data: callData,
        from: self.web3.eth.accounts[1] // TODO: get account address from pubkey
      }

      const tx = new TX(rawTx, 3)
      tx.sign(this.hexToBuffer(self.privateKey))
      const serialized = tx.serialize()

      //let txHash = await self.web3.eth.sendRawTransaction(this.bufferToHex(serialized))
      let txHash = '0x8d470165aa3cee1f5d6e927b90d20a59a14318964fa67846a230535443b83f07'
      console.log(self.web3.eth.accounts[1])
      return txHash
    },

    waitForConfirm: async function(txHash) {
      //console.log('waiting for '+txHash+' to be confirmed...')
      let receipt = await self.web3.eth.getTransactionReceipt(txHash)
      
      if(receipt == null) {
        await this.timeout(1000)
        await this.waitForConfirm(txHash)
      } else {
        //console.log('Contract Address: '+ receipt.contractAddress)
        return
      }
    },

    timeout: function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },

    getBytes: function getBytes(input) {
      if(Buffer.isBuffer(input)) input = '0x' + input.toString('hex')
      if(66-input.length <= 0) return self.web3.toHex(input)
      return this.padBytes32(self.web3.toHex(input))
    },

    sha3: function sha3(input) {
      return self.web3.sha3(input, {encoding: 'hex'})
    },

    sign: function sign(message, key) {
      // TODO, web3 1.0.0 has a method for this but 
      // is not stable yet
      return ethutil.ecsign(this.hexToBuffer(message), this.hexToBuffer(key))
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
        m += this.getBytes(inputs[i]).substr(2, this.getBytes(inputs[i]).length)
      }
      return m
    },

    getCTFaddress: function getCTFaddress(_r) {
      return self.web3.sha3(_r, {encoding: 'hex'})
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
    }
  }
}