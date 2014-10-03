'use strict';

module.exports = function($scope, taxData, taxService, graph) {
  $scope.clearGraph = graph.clear.bind(graph);
  $scope.settings = graph.settings;
  $scope.colors = graph.colors;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.graphLines = taxData.taxTypes;

  $scope.data = {
    states: {
      CA: true,
      NY: true,
      TX: true
    },
    status: 'single',
    graphLines: {
      effective: true,
      marginal: false
    }
  };

  $scope.createTaxRateFn = function(tax, filingStatus, isEffective) {
    return function(income) {
      if (isEffective) {
        return taxService.calcEffectiveTaxRate(tax, income, filingStatus);
      } else {
        return taxService.calcMarginalTaxRate(tax, income, filingStatus);
      }
    };
  };

  $scope.drawGraph = function() {
    var filingStatus = $scope.data.status,
        xMax = $scope.settings.xMax,
        graphLines = $scope.data.graphLines,
        tooltipFn,
        total = [],
        stateNames = [],
        data;

    for (var state in $scope.data.states) {
      if ($scope.data.states[state]) {
        stateNames.push(state);
        total.push(taxService.calcTotalMarginalTaxBrackets(
          taxData.getTaxes(state), xMax, filingStatus
        ));
      }
    }

    graph.clear();
    graph.update($scope.settings);

    for (var i = 0, len = total.length; i < len; i++) {
      if (graphLines.effective) {
        data = taxService.createEffectiveTaxData(total[i], xMax);
        tooltipFn = $scope.createTaxRateFn(total[i], filingStatus, true);
        graph.addLine(data, stateNames[i] + ' Effective', tooltipFn, true);
      }

      if (graphLines.marginal) {
        data = taxService.createMarginalTaxData(total[i], xMax);
        tooltipFn = $scope.createTaxRateFn(total[i], filingStatus);
        graph.addLine(data, stateNames[i] + ' Marginal', tooltipFn);
      }
    }

    graph.drawLines();
  };

  $scope.init = function() {
    taxData.get().then(function() {
      graph.init();
      $scope.drawGraph();
    });
  };

  $scope.init();
};