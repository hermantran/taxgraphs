'use strict';

module.exports = /* @ngInject */ function($routeProvider) {
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
    .when('/take-home-pay', {
      templateUrl: 'assets/templates/take-home-pay.html',
      controller: 'TakeHomePayCtrl',
      title: 'Take Home Pay'
    })
    .otherwise({
      redirectTo: '/'
    });
};