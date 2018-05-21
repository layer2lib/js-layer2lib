'use strict'

// Using in memory data storage for now to define structures
//const MongoClient = require('mongodb').MongoClient

module.exports = class BaseStorageProxy {
    constructor() {}
    logdriver() {}
    async set(k, v) {}
    async get(query) {
        return null;
    }
    async keys() {
        return [];
    }
    async serialize() {
        const keys = await this.keys();
        const obj = {};
        for (var i = 0; i < keys.length; i++) {
            const key = keys[i];
            obj[key] = await this.get(key);
        }
        return JSON.stringify(obj);
    }
    async deserialize(objstr) {
        const obj = JSON.parse(objstr);
        const keys = await Array.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            const key = keys[i];
            const v = obj[key];
            await this.set(key, v);
        }
        return;
    }
}