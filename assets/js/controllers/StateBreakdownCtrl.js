'use strict';

module.exports = function($scope, $rootScope, taxData) {
  $scope.$watch('state', function() {
    if ($scope.state) {
      $scope.taxNames = taxData.getTaxNames($scope.state);
    }
  });
};