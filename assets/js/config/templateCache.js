'use strict';

// http://stackoverflow.com/questions/22080981/loading-ng-include-partials-from-local-pre-loaded-jst-template-cache
module.exports = function($provide, JST) {
  $provide.decorator('$templateCache', function($delegate) {
    var originalGet = $delegate.get;

    $delegate.get = function(key) {
      var value;
      value = originalGet(key);
      if (!value) {
        // JST is where my partials and other templates are stored
        // If not already found in the cache, look there...
        value = JST[key]();
        if (value) {
          $delegate.put(key, value);
        }
      }
      return value;
    };

    return $delegate;
  });

  return this;
};