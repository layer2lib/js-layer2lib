'use strict'
const BaseStorageProxy = require('./BaseStorageProxy');
//import localforage from 'localforage';

// Uses local storage, depending on how forage is configured

module.exports = class BrowserStorageProxy extends BaseStorageProxy {
    constructor(localforage, name) {
        super();
        if (!localforage) throw new Error('localforage object or instance missing from constructor');
        // Create storage instance if name given
        this.forage = localforage.getItem ? localforage : localforage.createInstance({
            name: name || 'layer2lib'
        });
        this.forage.setItem('init', true);
    }
    // Log out current engine
    // TODO: remove later once API is stable

    logdriver() {
        console.log('js-layer2lib using web driver ', localforage.driver());
    }
    async set(k, v) {
        await this.forage.setItem(k, JSON.stringify(v));
    }
    async get(query) {
        let res = await this.forage.getItem(query)
        return JSON.parse(res)
    }
    async keys() {
        return await localforage.keys();
    }
}