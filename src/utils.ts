import { Buffer } from "buffer";
import * as Web3 from "web3";
import * as assert from "power-assert";
var web3: Web3;

export default {
  init(web3: Web3) {
    web3 = web3 || new Web3();
  },
  latestTime: function(): any {
    return web3.eth.getBlock("latest").timestamp;
  },

  increaseTime: function increaseTime(duration: number) {
    const id = Date.now();

    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          jsonrpc: "2.0",
          method: "evm_increaseTime",
          params: [duration],
          id: id
        },
        e1 => {
          if (e1) return reject(e1);

          web3.currentProvider.sendAsync(
            {
              jsonrpc: "2.0",
              method: "evm_mine",
              id: id + 1,
              params: []
            },
            (e2: any, res: any) => {
              return e2 ? reject(e2) : resolve(res);
            }
          );
        }
      );
    });
  },

  increaseTimeTo: function increaseTimeTo(target: any) {
    let now = this.latestTime();
    if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
    let diff = target - now;
    return this.increaseTime(diff);
  },

  assertThrowsAsync: async function assertThrowsAsync(fn: any, regExp: RegExp) {
    let f = () => {};
    try {
      await fn();
    } catch (e) {
      f = () => {
        throw e;
      };
    } finally {
      assert.throws(f, regExp);
    }
  },

  duration: {
    seconds: function(val: number) {
      return val;
    },
    minutes: function(val: number) {
      return val * this.seconds(60);
    },
    hours: function(val: number) {
      return val * this.minutes(60);
    },
    days: function(val: number) {
      return val * this.hours(24);
    },
    weeks: function(val: number) {
      return val * this.days(7);
    },
    years: function(val: number) {
      return val * this.days(365);
    }
  },

  getBytes: function getBytes(input: any) {
    if (Buffer.isBuffer(input)) input = "0x" + input.toString("hex");
    if (66 - input.length <= 0) return web3.toHex(input);
    return this.padBytes32(web3.toHex(input));
  },

  sha3: function sha3(input: string) {
    return web3.sha3(input, { encoding: "hex" });
  },

  marshallState: function marshallState(inputs: any) {
    var m = this.getBytes(inputs[0]);

    for (var i = 1; i < inputs.length; i++) {
      m += this.getBytes(inputs[i]).substr(2, this.getBytes(inputs[i]).length);
    }
    return m;
  },

  getCTFaddress: async function getCTFaddress(_r: any) {
    return web3.sha3(_r, { encoding: "hex" });
  },

  getCTFstate: async function getCTFstate(_contract: string, _signers: any, _args: any) {
    _args.unshift(_contract);
    var _m = this.marshallState(_args);
    _signers.push(_contract.length);
    _signers.push(_m);
    var _r = this.marshallState(_signers);
    return _r;
  },

  padBytes32: function padBytes32(data: any): string {
    // TODO: check input is hex / move to TS
    let l = 66 - data.length;

    let x = data.substr(2, data.length);

    for (var i = 0; i < l; i++) {
      x = 0 + x;
    }
    return "0x" + x;
  },

  rightPadBytes32: function rightPadBytes32(data: any): any {
    let l = 66 - data.length;

    for (var i = 0; i < l; i++) {
      data += 0;
    }
    return data;
  },

  hexToBuffer: function hexToBuffer(hexString: string): Buffer {
    return new Buffer(hexString.substr(2, hexString.length), "hex");
  },

  bufferToHex: function bufferToHex(buffer): string {
    return "0x" + buffer.toString("hex");
  },

  isHash: function isHash(buffer) {
    return buffer.length === 32 && Buffer.isBuffer(buffer);
  }
};
