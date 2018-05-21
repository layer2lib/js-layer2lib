'use strict'
const BaseStorageProxy = require('./BaseStorageProxy');
// Using in memory data storage for now to define structures
//const MongoClient = require('mongodb').MongoClient
const prefix = ''; // TODO: in the future use prefix 'layer2_'
module.exports = class RedisStorageProxy extends BaseStorageProxy {
    constructor(redis) {
        super();
        if (!redis) throw new Error('Redis instance missing from constructor');
        if (!redis.getAsync) throw new Error('Redis instance async wrapped');
        this.redis = redis;
        // TODO: remove later once API is stable
    }
    logdriver() {
        // Log out current engine
        console.log('js-layer2lib using driver Redis');
    }
    async set(k, v) {
        await this.redis.setAsync(prefix + k, JSON.stringify(v))
    }
    async get(key) {
        let res = await this.redis.getAsync(prefix + key)
        return JSON.parse(res)
    }
    async keys() {
        return await this.redis.keysAsync(prefix + '*')
    }
}