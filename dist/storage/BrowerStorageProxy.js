'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseStorageProxy = require('./BaseStorageProxy');
//import localforage from 'localforage';

// Uses local storage, depending on how forage is configured

module.exports = function (_BaseStorageProxy) {
    _inherits(BrowserStorageProxy, _BaseStorageProxy);

    function BrowserStorageProxy(localforage, name) {
        _classCallCheck(this, BrowserStorageProxy);

        var _this = _possibleConstructorReturn(this, (BrowserStorageProxy.__proto__ || Object.getPrototypeOf(BrowserStorageProxy)).call(this));

        if (!localforage) throw new Error('localforage object or instance missing from constructor');
        // Create storage instance if name given
        _this.forage = localforage.getItem ? localforage : localforage.createInstance({
            name: name || 'layer2lib'
        });
        _this.forage.setItem('init', true);
        return _this;
    }
    // Log out current engine
    // TODO: remove later once API is stable

    _createClass(BrowserStorageProxy, [{
        key: 'logdriver',
        value: function logdriver() {
            console.log('js-layer2lib using web driver ', localforage.driver());
        }
    }, {
        key: 'set',
        value: async function set(k, v) {
            await this.forage.setItem(k, JSON.stringify(v));
        }
    }, {
        key: 'get',
        value: async function get(query) {
            var res = await this.forage.getItem(query);
            return JSON.parse(res);
        }
    }, {
        key: 'keys',
        value: async function keys() {
            return await localforage.keys();
        }
    }]);

    return BrowserStorageProxy;
}(BaseStorageProxy);