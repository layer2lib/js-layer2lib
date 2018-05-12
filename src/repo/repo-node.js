'use strict'

// Using in memory data storage for now to define structures
//const MongoClient = require('mongodb').MongoClient

module.exports = function reponode (self) {
  return {
    connect: async function(url) {	
      //self.db = await MongoClient.connect(url)
    },
    terminate: async function() {
      //self.db.close()
    },
    set: async function(table) {
      self.db = Object.assign(self.db, table)

      // let _db = await MongoClient.connect('mongodb://localhost:27017/layer2db-test')
      // let _dbo = await _db.db(collection)
      // let col = await _dbo.collection(collection, {strict:false});

      // col.insert(doc)
      // _db.close()
    },
    get: async function(query) {
      // let _db = await MongoClient.connect('mongodb://localhost:27017/layer2db-test')
      // let _dbo = await _db.db(collection)
      // let _col = await _dbo.collection(collection, {strict:false})
      // let _data = await _col.find({})
      // let _r = await _data.toArray()
      // _db.close()
      // return _r
      if(!self.db.hasOwnProperty(query)) return {}

      return self.db[query]
    }
  }
}

