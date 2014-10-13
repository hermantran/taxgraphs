'use strict';

module.exports = function($scope, taxData, taxService, graph, cache, tips) {
  $scope.clearGraph = graph.clear.bind(graph);
  $scope.settings = graph.settings;
  $scope.colors = graph.colors;
  $scope.animationTimes = graph.animationTimes;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.stateNames = taxData.stateNames;
  $scope.graphTypes = taxData.taxTypes;
  $scope.tips = tips.list;
  $scope.closeTip = tips.close;

  if (!cache.get('stateBreakdownData')) {
    cache.set('stateBreakdownData', {
      state: 'CA',
      status: 'single',
      graphLines: {
        effective: true,
        marginal: false,
        totalEffective: true,
        totalMarginal: true
      }
    });
  }

  $scope.data = cache.get('stateBreakdownData');

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
        label,
        data,
        total,
        args;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;

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
        label = taxNames[i] + (graphLines.marginal ? ' (E)' : '');
        data = taxService.createEffectiveTaxData.apply(taxService, args);
        tooltipFn = $scope.createTaxRateFn(taxes[i], filingStatus, true);
        graph.addLine(data, label, tooltipFn, true);
      }

      if (graphLines.marginal) {
        label = taxNames[i] + (graphLines.effective ? ' (M)' : '');
        data = taxService.createMarginalTaxData.apply(taxService, args);
        tooltipFn = $scope.createTaxRateFn(taxes[i], filingStatus);
        graph.addLine(data, label, tooltipFn);
      }
    }

    if (graphLines.totalMarginal) {
      data = taxService.createMarginalTaxData(total, xMax);
      tooltipFn = $scope.createTaxRateFn(total, filingStatus);
      graph.addLine(data, 'Total Marginal', tooltipFn);
    }

    if (graphLines.totalEffective) {
      data = taxService.createEffectiveTaxData(total, xMax);
      tooltipFn = $scope.createTaxRateFn(total, filingStatus, true);
      graph.addLine(data, 'Total Effective', tooltipFn, true);
    }

    graph.drawLines();
    graph.updateTitle($scope.stateNames[state] + ' Income Tax Rates, 2014');
  };

  $scope.init = function() {
    graph.init();
    $scope.drawGraph();
  };

  taxData.get().then($scope.init);
};