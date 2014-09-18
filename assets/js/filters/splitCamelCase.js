'use strict';

// http://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form
module.exports = function() {
  return function(input) {
    return input
      .replace(/([A-Z])/g, ' $1')
      // uppercase the first character
      .replace(/^./, function(str) { return str.toUpperCase(); });
  };
};