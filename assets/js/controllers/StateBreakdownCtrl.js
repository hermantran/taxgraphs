'use strict';

module.exports = function($scope, taxData, taxService, graph) {
  $scope.clearGraph = graph.clear.bind(graph);
  $scope.settings = graph.settings;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.graphTypes = taxData.taxTypes;

  $scope.data = {
    state: 'CA',
    status: 'single',
    graphType: 'effective'
  };

  $scope.drawGraph = function() {
    var state = $scope.data.state,
        filingStatus = $scope.data.status,
        income = $scope.settings.xMax,
        yMax = $scope.settings.yMax,
        animationTime = $scope.settings.animationTime,
        taxes = taxData.getTaxes(state),
        data,
        total,
        args;

    total = taxService.calcTotalMarginalTaxBrackets(
      taxes, income, filingStatus
    );

    graph.clear();
    graph.updateXAxis(income);
    graph.updateYAxis(yMax);
    graph.updateAnimationTime(animationTime);
    graph.drawLine(taxService.createMarginalTaxData(total, income));
    graph.drawLine(taxService.createEffectiveTaxData(total, income), true);

    for (var i = 0; i < taxes.length; i++) {
      args = [taxes[i], income, filingStatus];

      if ($scope.data.graphType === 'effective') {
        data = taxService.createEffectiveTaxData.apply(taxService, args);
        graph.drawLine(data, true);
      } else {
        data = taxService.createMarginalTaxData.apply(taxService, args);
        graph.drawLine(data);
      }
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