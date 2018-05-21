declare module "js-layer2lib" {
  export default class Layer2lib {
    web3: any;
    merkleTree: any;
    utils: any;
    gsc: any;
    db: L2Database;

    /**
     * Initializes a web3 connection to the provider url
     *
     * @param str String to store in buffer.
     * @param encoding encoding to use, optional.  Default is 'utf8'
     */
    constructor(url: string, options: L2Options);

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

  export interface L2Options {
    db: L2Database;
    privateKey?: string;
  }
  export interface Agreement {
    ID: string;
    partyA: string;
    partyB: string;
    balanceA: string;
    balanceB: string;
    openPending?: boolean;
    inDispute?: false;
    stateRaw?: any[];
    stateSerialized?: string;
    signatures?: any[];
    subChannels?: any;
  }

  export interface L2Database {
    // connect(address: string, options: any): void;
    // terminate(): void;
    keys(): [string];
    logdriver(): void;
    serialize(): string;
    deserialize(obj: string): void;
    set(k: string, v: any): void;
    get(k: string): any;
  }
}
