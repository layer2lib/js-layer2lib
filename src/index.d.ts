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
  type StrObject = { [key: string]: string };
  type BigNumber = any;

  type VCID = string;
  type LCID = string;
  type Address = string;

  /*
  interface PartyKey {
    id: Address
    pubkey: string
  }
  */

  export interface State {
    id: string;
    nonce: string;
    isClosed?: boolean;
    party: Address;
    counterparty: Address;
    sig: string;
    sig_counterpary?: string;
  }
  /*
  interface Balances {
    balanceA: BigNumber
    balanceB: BigNumber
  }
  */
  export interface LCState extends State {
    openVCs: number;
    vcRootHash: string;
    balanceA: BigNumber;
    balanceB: BigNumber;
  }

  export interface VCState extends State {
    lcId: string;
    balanceA: BigNumber;
    balanceB: BigNumber;
    appState: StrObject | null; // challenger?: address;
  }

  /*
  interface PaymentState extends LCState {
    sender: Address
    balance: string
  }
  */

  export interface L2Database {
    logdriver(): void;
    set(k: string, v: any): void; // for misc data
    get(k: string): any;

    storeLC(data: LCState): Promise<LCState>;
    updateLC(data: LCState): Promise<LCState>; // replace if same nonce
    getLC(ledgerID: LCID): Promise<LCState>; // latest by nonce
    getLCs(): Promise<LCState[]>; // latest by nonce
    getLCsMap(cb: (lc: LCState) => void): void; // TODO replace above
    delLC(id: LCID): Promise<void>;

    storeVChannel(data: VCState): Promise<VCState>;
    delVChannel(chan: VCID): Promise<void>;
    // replace if same nonce
    updateVChannel(data: VCState): Promise<VCState>;
    getVChannel(ledger: VCID): Promise<VCState>; // latest by nonce
    getVChannels(ledger: LCID, cb: (lc: VCState) => void): Promise<void>; // latest by nonce
    getAllVChannels(cb: (lc: VCState) => void): Promise<void>;
  }
}
