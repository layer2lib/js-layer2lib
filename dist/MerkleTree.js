'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('buffer').Buffer;
var util = require('ethereumjs-util');
var localUtils = require('./utils');

function combinedHash(first, second) {
  if (!second) {
    return first;
  }
  if (!first) {
    return second;
  }
  var sorted = Buffer.concat([first, second].sort(Buffer.compare));

  return util.sha3(sorted);
}

function deduplicate(buffers) {
  return buffers.filter(function (buffer, i) {
    return buffers.findIndex(function (e) {
      return e.equals(buffer);
    }) === i;
  });
}

function getPair(index, layer) {
  var pairIndex = index % 2 ? index - 1 : index + 1;
  if (pairIndex < layer.length) {
    return layer[pairIndex];
  } else {
    return null;
  }
}

function getLayers(elements) {
  if (elements.length === 0) {
    return [[Buffer.from('')]];
  }
  var layers = [];
  layers.push(elements);
  while (layers[layers.length - 1].length > 1) {
    layers.push(getNextLayer(layers[layers.length - 1]));
  }
  return layers;
}

function getNextLayer(elements) {
  return elements.reduce(function (layer, element, index, arr) {
    if (index % 2 === 0) {
      layer.push(combinedHash(element, arr[index + 1]));
    }
    return layer;
  }, []);
}

function isHash(buffer) {
  return buffer.length === 32 && Buffer.isBuffer(buffer);
}

module.exports = function () {
  function MerkleTree(_elements) {
    _classCallCheck(this, MerkleTree);

    if (!_elements.every(isHash)) {
      throw new Error('elements must be 32 byte buffers');
    }
    var e = { elements: deduplicate(_elements) };
    Object.assign(this, e);

    this.elements.sort(Buffer.compare);

    var l = { layers: getLayers(this.elements) };
    Object.assign(this, l);
  }

  _createClass(MerkleTree, [{
    key: 'getRoot',
    value: function getRoot() {
      if (!this.root) {
        var r = { root: this.layers[this.layers.length - 1][0] };
        Object.assign(this, r);
      }
      return this.root;
    }
  }, {
    key: 'verify',
    value: function verify(proof, element) {
      return this.root.equals(proof.reduce(function (hash, pair) {
        return combinedHash(hash, pair);
      }, element));
    }
  }, {
    key: 'proof',
    value: function proof(element) {
      var index = this.elements.findIndex(function (e) {
        return e.equals(element);
      });
      if (index === -1) {
        throw new Error('element not found in merkle tree');
      }

      return this.layers.reduce(function (proof, layer) {
        var pair = getPair(index, layer);
        if (pair) {
          proof.push(pair);
        }
        index = Math.floor(index / 2);
        return proof;
      }, []);
    }
  }]);

  return MerkleTree;
}();