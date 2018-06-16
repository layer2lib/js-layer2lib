'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseStorageProxy = require('./BaseStorageProxy');

module.exports = function (_BaseStorageProxy) {
    _inherits(RedisStorageProxy, _BaseStorageProxy);

    function RedisStorageProxy(redis, prefix) {
        _classCallCheck(this, RedisStorageProxy);

        var _this = _possibleConstructorReturn(this, (RedisStorageProxy.__proto__ || Object.getPrototypeOf(RedisStorageProxy)).call(this));

        if (!redis) throw new Error('Redis instance missing from constructor');
        if (!redis.getAsync) throw new Error('Redis instance async not wrapped');
        _this.redis = redis;
        _this.prefix = prefix || '';
        return _this;
    }

    _createClass(RedisStorageProxy, [{
        key: 'logdriver',
        value: function logdriver() {
            // Log out current engine
            console.log('js-layer2lib using Redis driver');
        }
    }, {
        key: 'set',
        value: async function set(k, v) {
            await this.redis.setAsync(this.prefix + k, JSON.stringify(v));
        }
    }, {
        key: 'get',
        value: async function get(key) {
            var res = await this.redis.getAsync(this.prefix + key);
            return JSON.parse(res);
        }
    }, {
        key: 'keys',
        value: async function keys() {
            return await this.redis.keysAsync(this.prefix + '*');
        }
    }]);

    return RedisStorageProxy;
}(BaseStorageProxy);