declare module 'js-layer2lib' {
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
    storeGSCAgreement(options: any): void;
    getGSCAgreement(ID: string): Promise<Agreement>; //agreement
    joinGSCAgreement(agreement: Agreement): Promise<void>;
  }

  export class BrowserStorageProxy extends BaseStorageProxy {
    constructor(localforage: any, name?: string);
  }

  export class MemStorageProxy extends BaseStorageProxy {
    constructor(url: string, options: L2Options);
  }

  export class RedisStorageProxy extends BaseStorageProxy {
    constructor(redis: any);
  }

  export class GunStorageProxy extends BaseStorageProxy {
    constructor(gun: any);
  }

  export class BaseStorageProxy implements L2Database {
    constructor(redis: any);
    keys(): [string];
    serialize(): string;
    deserialize(obj: string): void;
    logdriver(): void;
    set(k: string, v: any): void;
    get(k: string): any;
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

  //type Party = string;
  type VCID = string;
  type LCID = string;

  interface PartySig {
    id: string;
    pubsig: string;
  }
  interface PartyState {
    id: string;
    balance: string;
  }
  interface PartySigState extends PartySig, PartyState {}
  interface Transaction {
    id: string;
    partyA: PartyState;
    partyB: PartyState;
  }
  interface VChannel {
    id: string;
    [key: string]: any;
  }
  interface LChannel {
    id: string;
    [key: string]: any;
  }
  export interface L2Database {
    logdriver(): void;
    set(k: string, v: any): void; // for misc data
    get(k: string): any;

    storeLC(data: any): Promise<LChannel>;
    getLC(ledgerID: VCID): Promise<LChannel>;
    getLCs(): Promise<LChannel[]>;

    storeVChannel(ledger: LCID, partyA: PartySigState, partyB: PartySigState, data: any): Promise<VCID>;
    getVChannel(ledger: VCID): Promise<VChannel>;
    getVChannelsByCounterParty(ledger: LCID, partyB: string): Promise<VChannel[]>;
    getAllVChannels(ledger?: LCID): Promise<VChannel[]>;

    updateVChannel(chan: VCID, data: Transaction): Promise<any>;
    getVChannelUpdates(chan: VCID): Promise<Transaction[]>;

    setSignature(partyID: string, signature: string): void; // for either VC or LC
    getSignature(partyID: string): string;
  }
}
