'use strict';

module.exports = function($scope, $filter, taxData, taxService, graph, cache, tips) {
  $scope.settings = graph.settings;
  $scope.colors = graph.colors;
  $scope.animationTimes = graph.animationTimes;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.stateNames = taxData.stateNames;
  $scope.deductions = taxData.deductions;
  $scope.tips = tips.list;
  $scope.closeTip = tips.close;

  if (!cache.get('stateBreakdownData')) {
    cache.set('stateBreakdownData', {
      state: 'CA',
      status: 'single',
      deductions: {
        standardDeduction: true,
        personalExemption: true
      },
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
        fedIncomeIndex = taxData.getTaxNames(state).indexOf('Federal Income'),
        deductions = [],
        primaryTitle,
        secondaryTitle,
        tooltipFn,
        label,
        data,
        total,
        args;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;

    for (var deduction in $scope.data.deductions) {
      if ($scope.data.deductions[deduction]) {
        deductions.push(taxData.getDeduction(deduction));
      }
    }

    taxes[fedIncomeIndex] = taxService.modifyTaxBracket(
      taxes[fedIncomeIndex], filingStatus, deductions
    );

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
    primaryTitle = $scope.stateNames[state] + ' Income Tax Rates, 2014';
    secondaryTitle = $filter('splitCamelCase')(filingStatus) + ' Filing Status, ' +
      (deductions.length ? ' Standard Deduction' : 'no deductions');
    graph.updateTitle(primaryTitle, secondaryTitle);
    $scope.$emit('hideMobileControls');
  };

  $scope.init = function() {
    graph.init();
    $scope.drawGraph();
  };

  taxData.get().then($scope.init);
};