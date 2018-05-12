define("utils", ["require", "exports", "buffer", "web3", "power-assert"], function (require, exports, buffer_1, Web3, assert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var web3;
    exports.default = {
        init(web3) {
            web3 = web3 || new Web3();
        },
        latestTime: function () {
            return web3.eth.getBlock("latest").timestamp;
        },
        increaseTime: function increaseTime(duration) {
            const id = Date.now();
            return new Promise((resolve, reject) => {
                web3.currentProvider.sendAsync({
                    jsonrpc: "2.0",
                    method: "evm_increaseTime",
                    params: [duration],
                    id: id
                }, e1 => {
                    if (e1)
                        return reject(e1);
                    web3.currentProvider.sendAsync({
                        jsonrpc: "2.0",
                        method: "evm_mine",
                        id: id + 1,
                        params: []
                    }, (e2, res) => {
                        return e2 ? reject(e2) : resolve(res);
                    });
                });
            });
        },
        increaseTimeTo: function increaseTimeTo(target) {
            let now = this.latestTime();
            if (target < now)
                throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
            let diff = target - now;
            return this.increaseTime(diff);
        },
        assertThrowsAsync: async function assertThrowsAsync(fn, regExp) {
            let f = () => { };
            try {
                await fn();
            }
            catch (e) {
                f = () => {
                    throw e;
                };
            }
            finally {
                assert.throws(f, regExp);
            }
        },
        duration: {
            seconds: function (val) {
                return val;
            },
            minutes: function (val) {
                return val * this.seconds(60);
            },
            hours: function (val) {
                return val * this.minutes(60);
            },
            days: function (val) {
                return val * this.hours(24);
            },
            weeks: function (val) {
                return val * this.days(7);
            },
            years: function (val) {
                return val * this.days(365);
            }
        },
        getBytes: function getBytes(input) {
            if (buffer_1.Buffer.isBuffer(input))
                input = "0x" + input.toString("hex");
            if (66 - input.length <= 0)
                return web3.toHex(input);
            return this.padBytes32(web3.toHex(input));
        },
        sha3: function sha3(input) {
            return web3.sha3(input, { encoding: "hex" });
        },
        marshallState: function marshallState(inputs) {
            var m = this.getBytes(inputs[0]);
            for (var i = 1; i < inputs.length; i++) {
                m += this.getBytes(inputs[i]).substr(2, this.getBytes(inputs[i]).length);
            }
            return m;
        },
        getCTFaddress: async function getCTFaddress(_r) {
            return web3.sha3(_r, { encoding: "hex" });
        },
        getCTFstate: async function getCTFstate(_contract, _signers, _args) {
            _args.unshift(_contract);
            var _m = this.marshallState(_args);
            _signers.push(_contract.length);
            _signers.push(_m);
            var _r = this.marshallState(_signers);
            return _r;
        },
        padBytes32: function padBytes32(data) {
            // TODO: check input is hex / move to TS
            let l = 66 - data.length;
            let x = data.substr(2, data.length);
            for (var i = 0; i < l; i++) {
                x = 0 + x;
            }
            return "0x" + x;
        },
        rightPadBytes32: function rightPadBytes32(data) {
            let l = 66 - data.length;
            for (var i = 0; i < l; i++) {
                data += 0;
            }
            return data;
        },
        hexToBuffer: function hexToBuffer(hexString) {
            return new buffer_1.Buffer(hexString.substr(2, hexString.length), "hex");
        },
        bufferToHex: function bufferToHex(buffer) {
            return "0x" + buffer.toString("hex");
        },
        isHash: function isHash(buffer) {
            return buffer.length === 32 && buffer_1.Buffer.isBuffer(buffer);
        }
    };
});
define("MerkleTree", ["require", "exports", "buffer", "ethereumjs-util", "utils"], function (require, exports, buffer_2, util, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function combinedHash(first, second) {
        if (!second) {
            return first;
        }
        if (!first) {
            return second;
        }
        let sorted = buffer_2.Buffer.concat([first, second].sort(buffer_2.Buffer.compare));
        return util.sha3(sorted);
    }
    function deduplicate(buffers) {
        return buffers.filter((buffer, i) => {
            return buffers.findIndex(e => e.equals(buffer)) === i;
        });
    }
    function getPair(index, layer) {
        let pairIndex = index % 2 ? index - 1 : index + 1;
        if (pairIndex < layer.length) {
            return layer[pairIndex];
        }
        else {
            return null;
        }
    }
    function getLayers(elements) {
        if (elements.length === 0) {
            return [[buffer_2.Buffer.from("")]];
        }
        let layers = [];
        layers.push(elements);
        while (layers[layers.length - 1].length > 1) {
            layers.push(getNextLayer(layers[layers.length - 1]));
        }
        return layers;
    }
    function getNextLayer(elements) {
        return elements.reduce((layer, element, index, arr) => {
            if (index % 2 === 0) {
                layer.push(combinedHash(element, arr[index + 1]));
            }
            return layer;
        }, []);
    }
    class MerkleTree {
        constructor(_elements) {
            if (!_elements.every(utils_1.default.isHash)) {
                throw new Error("elements must be 32 byte buffers");
            }
            const e = { elements: deduplicate(_elements) };
            Object.assign(this.elements, e.elements);
            this.elements.sort(buffer_2.Buffer.compare);
            const l = { layers: getLayers(this.elements) };
            Object.assign(this, l);
        }
        getRoot() {
            if (!this.root) {
                let r = { root: this.layers[this.layers.length - 1][0] };
                Object.assign(this, r);
            }
            return this.root;
        }
        verify(proof, element) {
            return this.root.equals(proof.reduce((hash, pair) => combinedHash(hash, pair), element));
        }
        proof(element) {
            let index = this.elements.findIndex(e => e.equals(element));
            if (index === -1) {
                throw new Error("element not found in merkle tree");
            }
            return this.layers.reduce((proof, layer) => {
                let pair = getPair(index, layer);
                if (pair) {
                    proof.push(pair);
                }
                index = Math.floor(index / 2);
                return proof;
            }, []);
        }
    }
    exports.default = MerkleTree;
});
//import * as metachannel from "../contracts/general-state-channels/build/contracts/MetaChannel.json";
define("general-state-channel", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function gsc(self) {
        return {
            get: async function () {
                //console.log(this._getMetaChannelBytecode())
            },
            set: async function () { },
            _getMetaChannelBytecode: function () {
                return "";
                //return metachannel.deployedBytecode;
            }
        };
    }
    exports.default = gsc;
});
define("index", ["require", "exports", "web3", "general-state-channel", "MerkleTree", "utils"], function (require, exports, Web3, general_state_channel_1, MerkleTree_1, utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // const config = require('./config')
    // replaced by repo-browser when running in browser
    // const defaultRepo = require('./runtime/repo-nodejs')
    class Layer2lib {
        constructor(providerUrl) {
            const web3 = new Web3();
            const provider = new Web3.providers.HttpProvider(providerUrl);
            web3.setProvider(provider);
            this.web3 = web3;
            this.merkleTree = MerkleTree_1.default;
            this.utils = utils_2.default;
            this.utils.web3 = web3;
            this.gsc = general_state_channel_1.default(this);
        }
        async getMainnetBalance(address) {
            const web3 = this.web3;
            return web3.fromWei(web3.eth.getBalance(address), "ether");
        }
    }
    exports.default = Layer2lib;
});
// For jonathan's testing... will remove later
/*
var l = new Layer2lib("http://127.0.0.1:8545");
var y = l.getMainnetBalance("0x7ea92dBce5387f8fF480Fe5D557aBd4C7B09054f");
console.log(y);
*/
//# sourceMappingURL=index.js.map