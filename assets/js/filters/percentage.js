// https://gist.github.com/jeffjohnson9046/9470800
/* @ngInject */
module.exports = ($filter) => (input, decimals) => `${$filter('number')(input * 100, decimals)}%`;
