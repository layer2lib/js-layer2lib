'use strict'

// Using in memory data storage for now to define structures
//const MongoClient = require('mongodb').MongoClient

module.exports = function reponode (self) {
  let agreements = {}
  
  return {
    connect: async function(url) {	
      //self.db = await MongoClient.connect(url)
    },
    terminate: async function() {
      //self.db.close()
    },
    set: async function(collection, doc) {
      // let _db = await MongoClient.connect('mongodb://localhost:27017/layer2db-test')
      // let _dbo = await _db.db(collection)
      // let col = await _dbo.collection(collection, {strict:false});

      // col.insert(doc)
      // _db.close()
    },
    get: async function(collection) {
      // let _db = await MongoClient.connect('mongodb://localhost:27017/layer2db-test')
      // let _dbo = await _db.db(collection)
      // let _col = await _dbo.collection(collection, {strict:false})
      // let _data = await _col.find({})
      // let _r = await _data.toArray()
      // _db.close()
      // return _r
    }
  }
}

