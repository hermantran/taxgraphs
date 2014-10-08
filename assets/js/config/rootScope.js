'use strict';

function rootScope($rootScope, $location) {
  $rootScope.$on('$routeChangeSuccess', function() {
    $rootScope.activeRoute = $location.path();

    $rootScope.isActive = function(route) {
      return $rootScope.activeRoute === route;
    };
  });
}

module.exports = rootScope;