'use strict';

module.exports = function($scope, taxData, taxService, graph) {
  $scope.clearGraph = graph.clear.bind(graph);
  $scope.settings = graph.settings;
  $scope.colors = graph.colors;
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
    var state = $scope.data.state,
        filingStatus = $scope.data.status,
        xMax = $scope.settings.xMax,
        graphLines = $scope.data.graphLines,
        taxes = taxData.getTaxes(state),
        taxNames = taxData.getTaxNames(state),
        tooltipFn,
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
        tooltipFn = $scope.createTaxRateFn(taxes[i], filingStatus, true);
        graph.drawLine(data, taxNames[i], tooltipFn, true);
      }

      if (graphLines.marginal) {
        data = taxService.createMarginalTaxData.apply(taxService, args);
        tooltipFn = $scope.createTaxRateFn(taxes[i], filingStatus);
        graph.drawLine(data, taxNames[i], tooltipFn);
      }
    }

    if (graphLines.totalMarginal) {
      data = taxService.createMarginalTaxData(total, xMax);
      tooltipFn = $scope.createTaxRateFn(total, filingStatus);
      graph.drawLine(data, 'Total Marginal', tooltipFn);
    }

    if (graphLines.totalEffective) {
      data = taxService.createEffectiveTaxData(total, xMax);
      tooltipFn = $scope.createTaxRateFn(total, filingStatus, true);
      graph.drawLine(data, 'Total Effective', tooltipFn, true);
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