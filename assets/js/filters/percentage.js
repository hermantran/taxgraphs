'use strict';

// https://gist.github.com/jeffjohnson9046/9470800
/* @ngInject */
module.exports = function($filter) {
  return function(input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
};