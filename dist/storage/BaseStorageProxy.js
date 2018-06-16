'use strict';

// Using in memory data storage for now to define structures
//const MongoClient = require('mongodb').MongoClient

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function BaseStorageProxy() {
        _classCallCheck(this, BaseStorageProxy);
    }

    _createClass(BaseStorageProxy, [{
        key: 'logdriver',
        value: function logdriver() {}
    }, {
        key: 'set',
        value: async function set(k, v) {}
    }, {
        key: 'get',
        value: async function get(query) {
            return null;
        }
    }, {
        key: 'keys',
        value: async function keys() {
            return [];
        }
    }, {
        key: 'serialize',
        value: async function serialize() {
            var keys = await this.keys();
            var obj = {};
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                obj[key] = await this.get(key);
            }
            return JSON.stringify(obj);
        }
    }, {
        key: 'deserialize',
        value: async function deserialize(objstr) {
            var obj = JSON.parse(objstr);
            var keys = await Array.keys(obj);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var v = obj[key];
                await this.set(key, v);
            }
            return;
        }
    }]);

    return BaseStorageProxy;
}();