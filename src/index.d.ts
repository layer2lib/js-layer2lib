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

  // ============== START HERE =====================
  // this.db.
  //type Party = string;
  type VCID = string;
  type LCID = string;
  type Address = string;

  interface PartyKey {
    id: Address;
    pubkey: string;
  }

  interface State {
    Id: string;
    nonce: string;
    isClosed: boolean;
    party: Address;
    counterparty: Address;
    sig: string;
    sig_counterpary?: string;
  }

  type BigNumber = any;
  interface Balances {
    balanceA: BigNumber;
    balanceB: BigNumber;
  }

  interface LC_State extends State {
    openVCs: number;
    vc_root_hash: string;
    balances: Balances;
  }

  interface VC_State extends State {
    LC_ID: string;
    balances: Balances;
    app_state?: { [key: string]: string }; // challenger?: address;
  }

  interface PaymentState extends LC_State {
    sender: Address;
    balance: string;
  }

  export interface L2Database {
    logdriver(): void;
    set(k: string, v: any): void; // for misc data
    get(k: string): any;

    storeLC(data: LC_State): Promise<LC_State>;
    updateLC(data: LC_State): Promise<LC_State>; // replace if same nonce
    getLC(ledgerID: LCID): Promise<LC_State>; // latest by nonce
    getLCs(): Promise<LC_State[]>; // latest by nonce
    delLC(id: LCID): Promise<void>;

    storeVChannel(data: VC_State): Promise<VC_State>;
    delVChannel(chan: VCID): Promise<void>;
    // replace if same nonce
    updateVChannel(chan: VCID, data: VC_State): Promise<VC_State>;
    getVChannel(ledger: VCID): Promise<VC_State>; // latest by nonce
    getAllVChannels(ledger?: LCID): Promise<VC_State[]>; // latest by nonce
  }
}
