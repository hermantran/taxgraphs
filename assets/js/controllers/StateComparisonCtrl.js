'use strict';

module.exports = function($scope, $filter, taxData, taxService, graph, cache, tips) {
  $scope.settings = graph.settings;
  $scope.colors = graph.colors;
  $scope.animationTimes = graph.animationTimes;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.deductions = taxData.deductions;
  $scope.toggleState = false;
  $scope.tips = tips.list;
  $scope.closeTip = tips.close;
  $scope.openMobileControls = false;

  if (!cache.get('stateComparisonData')) {
    cache.set('stateComparisonData', {
      states: {
        CA: true,
        IL: true,
        PA: true,
        NY: true,
        TX: true
      },
      status: 'single',
      deductions: {
        standardDeduction: true,
        personalExemption: true
      },
      graphLines: {
        effective: true,
        marginal: false
      }
    });
  }

  $scope.data = cache.get('stateComparisonData');

  $scope.toggleStates = function(bool) {
    var state;
    for (var i = 0, len = $scope.states.length; i < len; i++) {
      state = $scope.states[i];
      $scope.data.states[state] = bool;
    }
  };

  $scope.keepUnchecked = function() {
    $scope.toggleState = false;
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
        deductions = [],
        total = [],
        stateNames = [],
        fedIncomeIndex,
        primaryTitle,
        secondaryTitle,
        taxes,
        tooltipFn,
        data;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;

    for (var deduction in $scope.data.deductions) {
      if ($scope.data.deductions[deduction]) {
        deductions.push(taxData.getDeduction(deduction));
      }
    }

    for (var state in $scope.data.states) {
      if ($scope.data.states[state]) {
        stateNames.push(state);
        taxes = taxData.getTaxes(state);
        fedIncomeIndex = taxData.getTaxNames(state).indexOf('Federal Income');
        taxes[fedIncomeIndex] = taxService.modifyTaxBracket(
          taxes[fedIncomeIndex], filingStatus, deductions
        );

        total.push(taxService.calcTotalMarginalTaxBrackets(
          taxes, xMax, filingStatus
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
    primaryTitle = 'State Income Tax Rates, 2014';
    secondaryTitle = $filter('splitCamelCase')(filingStatus) + ' Filing Status, ' +
      (deductions.length ? ' Standard Deduction' : 'no deductions');
    graph.updateTitle(primaryTitle, secondaryTitle);
    $scope.$emit('hideMobileControls');
  };

  $scope.init = function() {
    graph.init();
    $scope.settings.calculateAmount = false;
    $scope.drawGraph();
  };

  taxData.get().then($scope.init);
};