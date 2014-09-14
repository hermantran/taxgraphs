'use strict';

module.exports = function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'assets/templates/state-comparison.html',
      controller: 'StateComparisonCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
};