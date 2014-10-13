'use strict';

function rootScope($rootScope, $location) {
  $rootScope.$on('$routeChangeSuccess', function(e, route) {
    $rootScope.activeRoute = $location.path();
    $rootScope.title = route.title;

    $rootScope.isActive = function(route) {
      return $rootScope.activeRoute === route;
    };
  });
}

module.exports = rootScope;