/* @ngInject */
function routes($routeProvider, ROUTE_CONFIG) {
  $routeProvider
    .when(ROUTE_CONFIG.stateComparison.path, ROUTE_CONFIG.stateComparison)
    .when(ROUTE_CONFIG.stateBreakdown.path, ROUTE_CONFIG.stateBreakdown)
    .when(ROUTE_CONFIG.stateHistory.path, ROUTE_CONFIG.stateHistory)
    .when(ROUTE_CONFIG.takeHomePay.path, ROUTE_CONFIG.takeHomePay)
    .when(ROUTE_CONFIG.stockOptionAmt.path, ROUTE_CONFIG.stockOptionAmt)
    .otherwise({
      redirectTo: '/',
    });
}

export default routes;
