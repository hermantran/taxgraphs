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
    graphLines: {
      effective: true,
      marginal: false,
      totalEffective: true,
      totalMarginal: true
    }
  };

  $scope.drawGraph = function() {
    var state = $scope.data.state,
        filingStatus = $scope.data.status,
        xMax = $scope.settings.xMax,
        graphLines = $scope.data.graphLines,
        taxes = taxData.getTaxes(state),
        data,
        total,
        args;

    if (graphLines.totalEffective || graphLines.totalMarginal) {
      total = taxService.calcTotalMarginalTaxBrackets(
        taxes, xMax, filingStatus
      );
    }

    graph.clear();
    graph.update($scope.settings);

    for (var i = 0; i < taxes.length; i++) {
      args = [taxes[i], xMax, filingStatus];

      if (graphLines.effective) {
        data = taxService.createEffectiveTaxData.apply(taxService, args);
        graph.drawLine(data, true);
      }

      if (graphLines.marginal) {
        data = taxService.createMarginalTaxData.apply(taxService, args);
        graph.drawLine(data);
      }
    }

    if (graphLines.totalMarginal) {
      graph.drawLine(taxService.createMarginalTaxData(total, xMax));
    }

    if (graphLines.totalEffective) {
      graph.drawLine(taxService.createEffectiveTaxData(total, xMax), true);
    }
  };

  $scope.displayTooltip = function(eventData) {
    console.log(eventData);
  };

  $scope.init = function() {
    taxData.get().then(function() {
      graph.init();
      $scope.drawGraph();
    });
  };

  $scope.init();
};