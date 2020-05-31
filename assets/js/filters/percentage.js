// https://gist.github.com/jeffjohnson9046/9470800
/* @ngInject */
export default ($filter) => (input, decimals) => `${$filter('number')(input * 100, decimals)}%`;
