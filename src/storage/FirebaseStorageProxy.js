'use strict'
const BaseStorageProxy = require('./BaseStorageProxy');
// Using in memory data storage for now to define structures
//const MongoClient = require('mongodb').MongoClient
const prefix = ''; // TODO: in the future use prefix 'layer2_'
module.exports = class FirebaseStorageProxy extends BaseStorageProxy {
    constructor(firebase) {
        super();
        if (!firebase) throw new Error('Firebase instance missing from constructor');
        this.firebase = firebase;
        // TODO: remove later once API is stable
    }
    logdriver() {
        // Log out current engine
        console.log('js-layer2lib using Firebase driver');
    }
    async set(k, v) {
        await this.firebase.database().ref(prefix + k).set(v)
    }
    async get(key) {
        let res = await firebase.database().ref(key).once('value').then(snapshot => {
            return snapshot.val()
        })
        return res
    }
    async keys() {
        // this isn't very efficient because firebase doesn't provid method to return
        // only the keys
        // get the root object
        let res = await firebase.database().ref().once('value').then(snapshot => {
            return snapshot.val()
        })
        return Object.keys(res)
    }
}