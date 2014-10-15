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

  if (!cache.get('takeHomePayData')) {
    cache.set('takeHomePayData', {
      state: 'CA',
      status: 'single',
      deductions: {
        standardDeduction: true,
        personalExemption: true
      },
      itemized: 0
    });
  }

  $scope.data = cache.get('takeHomePayData');

  $scope.createTaxRateFn = function(tax, filingStatus) {
    return function(income) {
      return 1 - taxService.calcEffectiveTaxRate(tax, income, filingStatus);
    };
  };

  $scope.drawGraph = function() {
    var state = $scope.data.state,
        filingStatus = $scope.data.status,
        xMax = $scope.settings.xMax,
        taxes = taxData.getTaxes(state),
        fedIncomeIndex = taxData.getTaxNames(state).indexOf('Federal Income'),
        deductions = [],
        itemized = parseInt($scope.data.itemized, 10),
        primaryTitle,
        secondaryTitle,
        tooltipFn,
        data,
        total;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;
    itemized = isNaN(itemized) ? 0 : itemized;
    $scope.data.itemized = itemized;

    for (var deduction in $scope.data.deductions) {
      if ($scope.data.deductions[deduction]) {
        deductions.push(taxData.getDeduction(deduction));
      }
    }

    deductions.push(itemized);

    taxes[fedIncomeIndex] = taxService.modifyTaxBracket(
      taxes[fedIncomeIndex], filingStatus, deductions
    );

    total = taxService.calcTotalMarginalTaxBrackets(taxes, xMax, filingStatus);
    data = taxService.createTakeHomePayData(total, xMax);
    tooltipFn = $scope.createTaxRateFn(total, filingStatus, true);
    
    graph.clear();
    graph.update($scope.settings);
    graph.addLine(data, 'Net Income', tooltipFn, true);
    graph.drawLines();

    primaryTitle = $scope.stateNames[state] + ' Take Home Pay, 2014';
    secondaryTitle = $filter('splitCamelCase')(filingStatus) + ' Filing Status, ' +
      (deductions.length ? ' Standard Deduction' : 'no deductions') +
      (itemized > 0 ? ', $' + itemized + ' Itemized Deduction' : ''); 
    graph.updateTitle(primaryTitle, secondaryTitle);
    $scope.$emit('hideMobileControls');
  };

  $scope.init = function() {
    graph.init();
    $scope.settings.calculateAmount = true;
    $scope.drawGraph();
  };

  taxData.get().then($scope.init);
};