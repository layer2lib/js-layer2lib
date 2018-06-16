'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseStorageProxy = require('./BaseStorageProxy');
// Uses in-memory storage

module.exports = function (_BaseStorageProxy) {
    _inherits(BrowserStorageProxy, _BaseStorageProxy);

    function BrowserStorageProxy() {
        _classCallCheck(this, BrowserStorageProxy);

        var _this = _possibleConstructorReturn(this, (BrowserStorageProxy.__proto__ || Object.getPrototypeOf(BrowserStorageProxy)).call(this));

        if (!localforage) throw new Error('localforage object or instance missing from constructor');
        // Create storage instance if name given
        _this.db = {};
        return _this;
    }
    // Log out current engine
    // TODO: remove later once API is stable

    _createClass(BrowserStorageProxy, [{
        key: 'logdriver',
        value: function logdriver() {
            console.log('js-layer2lib using in-memory driver');
        }
    }, {
        key: 'set',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(k, v) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                // we still stringify to do deep copies
                                this.db[k] = JSON.stringify(v);

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function set(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return set;
        }()
    }, {
        key: 'get',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(query) {
                var res;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                res = this.db[k];
                                return _context2.abrupt('return', JSON.parse(res));

                            case 2:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function get(_x3) {
                return _ref2.apply(this, arguments);
            }

            return get;
        }()
    }, {
        key: 'keys',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                return _context3.abrupt('return', Object.keys(this.db));

                            case 1:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function keys() {
                return _ref3.apply(this, arguments);
            }

            return keys;
        }()
    }]);

    return BrowserStorageProxy;
}(BaseStorageProxy);