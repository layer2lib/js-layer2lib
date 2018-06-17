'use strict';

// Using in memory data storage for now to define structures
//const MongoClient = require('mongodb').MongoClient

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(k, v) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
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
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt('return', null);

                            case 1:
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
                                return _context3.abrupt('return', []);

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
    }, {
        key: 'serialize',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                var keys, obj, i, key;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.keys();

                            case 2:
                                keys = _context4.sent;
                                obj = {};
                                i = 0;

                            case 5:
                                if (!(i < keys.length)) {
                                    _context4.next = 13;
                                    break;
                                }

                                key = keys[i];
                                _context4.next = 9;
                                return this.get(key);

                            case 9:
                                obj[key] = _context4.sent;

                            case 10:
                                i++;
                                _context4.next = 5;
                                break;

                            case 13:
                                return _context4.abrupt('return', JSON.stringify(obj));

                            case 14:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function serialize() {
                return _ref4.apply(this, arguments);
            }

            return serialize;
        }()
    }, {
        key: 'deserialize',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(objstr) {
                var obj, keys, i, key, v;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                obj = JSON.parse(objstr);
                                _context5.next = 3;
                                return Array.keys(obj);

                            case 3:
                                keys = _context5.sent;
                                i = 0;

                            case 5:
                                if (!(i < keys.length)) {
                                    _context5.next = 13;
                                    break;
                                }

                                key = keys[i];
                                v = obj[key];
                                _context5.next = 10;
                                return this.set(key, v);

                            case 10:
                                i++;
                                _context5.next = 5;
                                break;

                            case 13:
                                return _context5.abrupt('return');

                            case 14:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function deserialize(_x4) {
                return _ref5.apply(this, arguments);
            }

            return deserialize;
        }()
    }]);

    return BaseStorageProxy;
}();