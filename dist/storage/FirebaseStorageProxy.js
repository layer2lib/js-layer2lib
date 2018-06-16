'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseStorageProxy = require('./BaseStorageProxy');
// Using in memory data storage for now to define structures
//const MongoClient = require('mongodb').MongoClient
var prefix = ''; // TODO: in the future use prefix 'layer2_'
module.exports = function (_BaseStorageProxy) {
    _inherits(FirebaseStorageProxy, _BaseStorageProxy);

    function FirebaseStorageProxy(firebase, prefix) {
        _classCallCheck(this, FirebaseStorageProxy);

        var _this = _possibleConstructorReturn(this, (FirebaseStorageProxy.__proto__ || Object.getPrototypeOf(FirebaseStorageProxy)).call(this));

        if (!firebase) throw new Error('Firebase instance missing from constructor');
        _this.firebase = firebase;
        _this.prefix = prefix;
        // TODO: remove later once API is stable
        return _this;
    }

    _createClass(FirebaseStorageProxy, [{
        key: 'logdriver',
        value: function logdriver() {
            // Log out current engine
            console.log('js-layer2lib using Firebase driver');
        }
    }, {
        key: 'set',
        value: async function set(k, v) {
            await this.firebase.database().ref(this.prefix + k).set(v);
        }
    }, {
        key: 'get',
        value: async function get(key) {
            var res = await this.firebase.database().ref(this.prefix + key).once('value').then(function (snapshot) {
                return snapshot.val();
            });
            return res;
        }
    }, {
        key: 'keys',
        value: async function keys() {
            // this isn't very efficient because firebase doesn't provid method to return
            // only the keys
            // get the root object
            var res = await this.firebase.database().ref().once('value').then(function (snapshot) {
                return snapshot.val();
            });
            return Object.keys(res);
        }
    }]);

    return FirebaseStorageProxy;
}(BaseStorageProxy);