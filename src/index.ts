import * as Web3 from "web3";
import GSC from "./general-state-channel";
import Merkle from "./MerkleTree";
import utils from "./utils";

// const config = require('./config')
// replaced by repo-browser when running in browser
// const defaultRepo = require('./runtime/repo-nodejs')

class Layer2lib {
  public web3: any;
  public utils: any;
  public gsc: any;
  public merkleTree: any;
  constructor(providerUrl: string) {
    const web3 = new Web3();
    const provider: Web3.Provider = new Web3.providers.HttpProvider(providerUrl) as Web3.Provider;
    web3.setProvider(provider);
    this.web3 = web3;

    this.merkleTree = Merkle;
    this.utils = utils;
    this.utils.web3 = web3;

    this.gsc = GSC(this);
  }

  async getMainnetBalance(address: string) {
    const web3 = this.web3;
    return web3.fromWei(web3.eth.getBalance(address), "ether");
  }
}

export default Layer2lib;

// For jonathan's testing... will remove later
/*
var l = new Layer2lib("http://127.0.0.1:8545");
var y = l.getMainnetBalance("0x7ea92dBce5387f8fF480Fe5D557aBd4C7B09054f");
console.log(y);
*/
