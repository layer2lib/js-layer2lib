declare module "utils" {
    import { Buffer } from "buffer";
    import * as Web3 from "web3";
    const _default: {
        init(web3: Web3): void;
        latestTime: () => any;
        increaseTime: (duration: number) => Promise<{}>;
        increaseTimeTo: (target: any) => Promise<{}>;
        assertThrowsAsync: (fn: any, regExp: RegExp) => Promise<void>;
        duration: {
            seconds: (val: number) => number;
            minutes: (val: number) => number;
            hours: (val: number) => number;
            days: (val: number) => number;
            weeks: (val: number) => number;
            years: (val: number) => number;
        };
        getBytes: (input: any) => string;
        sha3: (input: string) => string;
        marshallState: (inputs: any) => string;
        getCTFaddress: (_r: any) => Promise<string>;
        getCTFstate: (_contract: string, _signers: any, _args: any) => Promise<string>;
        padBytes32: (data: any) => string;
        rightPadBytes32: (data: any) => any;
        hexToBuffer: (hexString: string) => Buffer;
        bufferToHex: (buffer: any) => string;
        isHash: (buffer: any) => boolean;
    };
    export default _default;
}
declare module "MerkleTree" {
    export type Root = any;
    export type Element = any;
    export default class MerkleTree {
        elements: Element[];
        root: Root;
        layers: any;
        constructor(_elements: Element[]);
        getRoot(): Root;
        verify(proof: any, element: Element): boolean;
        proof(element: Element): any;
    }
}
declare module "general-state-channel" {
    export default function gsc(self: any): {
        get: () => Promise<void>;
        set: () => Promise<void>;
        _getMetaChannelBytecode: () => any;
    };
}
declare module "index" {
    class Layer2lib {
        web3: any;
        utils: any;
        gsc: any;
        merkleTree: any;
        constructor(providerUrl: string);
        getMainnetBalance(address: string): Promise<any>;
    }
    export default Layer2lib;
}
