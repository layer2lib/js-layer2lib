'use strict'
const BaseStorageProxy = require('./BaseStorageProxy');
// Uses in-memory storage

module.exports = class GunStorageProxy extends BaseStorageProxy {
    constructor(gun, prefix) {
        super()
        if (!gun) throw new Error('Redis instance missing from constructor')
        this.gun = gun
        this.prefix = prefix || ''
        this.dbKeys = {};
    }
    logdriver() {
        // Log out current engine
        console.log('js-layer2lib using gun driver');
    }
    async set(k, v) {
        this.dbKeys[k] = v;
        await this.gun.set(this.prefix + k, JSON.stringify(v))
    }
    async get(key) {
        let res = await gun.get(this.prefix + key).then();
        return JSON.parse(res)
    }
    async keys() {
        return Object.keys(this.dbKeys);
    }
}