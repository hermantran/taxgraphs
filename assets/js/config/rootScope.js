'use strict';

function rootScope($rootScope, $location, ga, GA_TRACKING_ID) {
  var isProd = $location.absUrl().indexOf('taxgraphs') > -1;

  if (isProd) {
    ga('create', GA_TRACKING_ID, 'auto');
  }

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

    if (isProd) {
      ga('send', 'pageview', {
        page: $rootScope.activeRoute,
        title: $rootScope.title
      });
    }
  });

  $rootScope.$on('hideMobileControls', function() {
    $rootScope.hideMobileControls = true;
  });
}

module.exports = rootScope;