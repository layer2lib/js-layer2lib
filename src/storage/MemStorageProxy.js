'use strict'
const BaseStorageProxy = require('./BaseStorageProxy');
// Uses in-memory storage

module.exports = class BrowserStorageProxy extends BaseStorageProxy {
    constructor() {
        super();
        if (!localforage) throw new Error('localforage object or instance missing from constructor');
        // Create storage instance if name given
        this.db = {};
    }
    // Log out current engine
    // TODO: remove later once API is stable

    logdriver() {
        console.log('js-layer2lib using driver ', localforage.driver());
    }
    async set(k, v) {
        // we still stringify to do deep copies
        this.db[k] = JSON.stringify(v);
    }
    async get(query) {
        let res = this.db[k];
        return JSON.parse(res)
    }
    async keys() {
        return Object.keys(this.db);
    }

}