'use strict';

module.exports = function() {
  var cache = {};

  this.get = function(key) {
    return cache[key];
  };

  this.set = function(key, value) {
    cache[key] = value;
  };
};