/* @ngInject */
function routes($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'assets/templates/pages/state-comparison.html',
      controller: 'StateComparisonCtrl',
      title: 'State Comparison',
    })
    .when('/state', {
      templateUrl: 'assets/templates/pages/state-breakdown.html',
      controller: 'StateBreakdownCtrl',
      title: 'State Breakdown',
    })
    .when('/take-home-pay', {
      templateUrl: 'assets/templates/pages/take-home-pay.html',
      controller: 'TakeHomePayCtrl',
      title: 'Take Home Pay',
    })
    .otherwise({
      redirectTo: '/',
    });
}

export default routes;
