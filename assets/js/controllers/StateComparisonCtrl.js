'use strict';

module.exports = function($scope, taxData, taxService, graph) {
  $scope.clearGraph = graph.clear.bind(graph);
  $scope.settings = graph.settings;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.graphTypes = taxData.taxTypes;

  $scope.data = {
    states: {
      CA: true,
      NY: true
    },
    status: 'single',
    graphType: 'effective'
  };

  $scope.drawGraph = function() {
    var filingStatus = $scope.data.status,
        xMax = $scope.settings.xMax,
        yMax = $scope.settings.yMax,
        animationTime = $scope.settings.animationTime,
        total = [];

    for (var state in $scope.data.states) {
      if ($scope.data.states[state]) {
        total.push(taxService.calcTotalMarginalTaxBrackets(
          taxData.getTaxes(state), xMax, filingStatus
        ));
      }
    }

    graph.clear();
    graph.updateXAxis(xMax);
    graph.updateYAxis(yMax);
    graph.updateAnimationTime(animationTime);

    for (var i = 0, len = total.length; i < len; i++) {
      graph.drawLine(
        taxService.createEffectiveTaxData(total[i], xMax), true
      );

      // graph.drawLine(
      //   taxService.createMarginalTaxData(total[i], $rootScope.xMax)
      // );
    }
  };

  $scope.init = function() {
    taxData.get().then(function() {
      graph.init();
      $scope.drawGraph();
    });
  };

  $scope.init();
};