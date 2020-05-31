/* eslint-disable no-param-reassign */
/* @ngInject */
function rootScope(
  $rootScope,
  $location,
  gtag,
  ROUTE_CONFIG,
  ROUTE_ORDER,
  DOMAIN,
  GA_TRACKING_ID,
  TAX_YEAR,
  tips,
) {
  const isProd = $location.absUrl().indexOf(DOMAIN) > -1;

  if (isProd) {
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID);
  }

  $rootScope.tips = tips.list;
  $rootScope.closeTip = tips.close;
  $rootScope.routeConfig = ROUTE_CONFIG;
  $rootScope.routeOrder = ROUTE_ORDER;
  $rootScope.currentYear = TAX_YEAR;

  $rootScope.$on('$routeChangeSuccess', (e, route) => {
    $rootScope.activeRoute = $location.path();
    $rootScope.title = route.title;
    $rootScope.hideMobileControls = true;

    $rootScope.isActive = (newRoute) => $rootScope.activeRoute === newRoute;

    $rootScope.toggleMobileControls = () => {
      $rootScope.hideMobileControls = !$rootScope.hideMobileControls;
    };

    if (isProd) {
      gtag('config', GA_TRACKING_ID, {
        page_path: $rootScope.activeRoute,
        page_title: $rootScope.title,
      });
    }
  });

  $rootScope.$on('hideMobileControls', () => {
    $rootScope.hideMobileControls = true;
  });
}

export default rootScope;
