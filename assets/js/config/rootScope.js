'use strict';

function rootScope($rootScope, $location) {
  $rootScope.$on('$routeChangeSuccess', function(e, route) {
    $rootScope.activeRoute = $location.path();
    $rootScope.title = route.title;
    $rootScope.hideMobileControls = true;

    $rootScope.isActive = function(route) {
      return $rootScope.activeRoute === route;
    };

    $rootScope.toggleMobileControls = function() {
      $rootScope.hideMobileControls = !$rootScope.hideMobileControls;
    };

    $rootScope.$on('hideMobileControls', function() {
      $rootScope.hideMobileControls = true;
    });
  });
}

module.exports = rootScope;