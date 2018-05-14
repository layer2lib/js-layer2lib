'use strict'

// Using in memory data storage for now to define structures
//const MongoClient = require('mongodb').MongoClient

module.exports = function repomem (self) {
  return {
    connect: async function(url) {	
      //self.db = await MongoClient.connect(url)
    },
    terminate: async function() {
      //self.db.close()
    },
    set: async function(k, v) {
      await self.db.set(k, JSON.stringify(v))
    },
    get: async function(query) {
      let res = await self.db.getAsync(query)
      return JSON.parse(res)
    }
  }
}

