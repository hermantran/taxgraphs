/* eslint-disable no-param-reassign */
/* @ngInject */
function rootScope($rootScope, $location, ga, DOMAIN, GA_TRACKING_ID, tips) {
  const isProd = $location.absUrl().indexOf(DOMAIN) > -1;

  if (isProd) {
    ga('create', GA_TRACKING_ID, 'auto');
  }

  $rootScope.tips = tips.list;
  $rootScope.closeTip = tips.close;

  $rootScope.$on('$routeChangeSuccess', (e, route) => {
    $rootScope.activeRoute = $location.path();
    $rootScope.title = route.title;
    $rootScope.hideMobileControls = true;

    $rootScope.isActive = (newRoute) => $rootScope.activeRoute === newRoute;

    $rootScope.toggleMobileControls = () => {
      $rootScope.hideMobileControls = !$rootScope.hideMobileControls;
    };

    if (isProd) {
      ga('send', 'pageview', {
        page: $rootScope.activeRoute,
        title: $rootScope.title,
      });
    }
  });

  $rootScope.$on('hideMobileControls', () => {
    $rootScope.hideMobileControls = true;
  });
}

module.exports = rootScope;
