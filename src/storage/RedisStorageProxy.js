'use strict'
const BaseStorageProxy = require('./BaseStorageProxy')

module.exports = class RedisStorageProxy extends BaseStorageProxy {
    constructor(redis, prefix) {
        super()
        if (!redis) throw new Error('Redis instance missing from constructor')
        if (!redis.getAsync) throw new Error('Redis instance async not wrapped')
        this.redis = redis
        this.prefix = prefix || ''
    }
    logdriver() {
        // Log out current engine
        console.log('js-layer2lib using Redis driver');
    }
    async set(k, v) {
        await this.redis.setAsync(this.prefix + k, JSON.stringify(v))
    }
    async get(key) {
        let res = await this.redis.getAsync(this.prefix + key)
        return JSON.parse(res)
    }
    async keys() {
        return await this.redis.keysAsync(this.prefix + '*')
    }
}