declare module "js-layer2lib" {
  export default class Layer2lib {
    web3: any;
    merkleTree: any;
    utils: any;
    gsc: any;

    /**
     * Initializes a web3 connection to the provider url
     *
     * @param str String to store in buffer.
     * @param encoding encoding to use, optional.  Default is 'utf8'
     */
    constructor(provider: string);

    /**
     * Returns the current balance as a string
     *
     * @param address Wallet address
     */
    getMainnetBalance(address: string): string;
    initGSC(options: any): void;
    createGSCAgreement(options: any): void;
    getGSCAgreement(ID: string): Promise<Agreement>; //agreement
    joinGSCAgreement(agreement: Agreement): Promise<void>;
  }
  interface Agreement {
    ID: string;
    partyA: string;
    partyB: string;
    balanceA: string;
    balanceB: string;
    openPending: boolean;
    inDispute: false;
    stateRaw: any[];
    stateSerialized: string;
    signatures: any[];
    subChannels: any;
  }
}
