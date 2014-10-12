'use strict';

module.exports = function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'assets/templates/state-comparison.html',
      controller: 'StateComparisonCtrl',
      title: 'State Comparison'
    })
    .when('/state', {
      templateUrl: 'assets/templates/state-breakdown.html',
      controller: 'StateBreakdownCtrl',
      title: 'State Breakdown'
    })
    .otherwise({
      redirectTo: '/'
    });
};