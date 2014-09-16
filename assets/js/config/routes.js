'use strict';

module.exports = function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'assets/templates/state-comparison.html',
      controller: 'StateComparisonCtrl'
    })
    .when('/state', {
      templateUrl: 'assets/templates/state-breakdown.html',
      controller: 'StateBreakdownCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
};