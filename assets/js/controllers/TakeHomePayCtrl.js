'use strict';

/* @ngInject */
function TakeHomePayCtrl($scope, $filter, taxData, taxService, graph, cache) {
  $scope.settings = graph.settings;
  $scope.colors = graph.colors;
  $scope.animationTimes = graph.animationTimes;
  $scope.years = taxData.years;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.stateNames = taxData.stateNames;
  $scope.deductions = taxData.deductions;

  if (!cache.get('takeHomePayData')) {
    cache.set('takeHomePayData', {
      state: 'CA',
      year: taxData.year,
      deductions: {
        standardDeduction: true,
        personalExemption: true
      },
      itemized: 0,
      graphLines: {
        single: true,
        married: true
      }
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
        year = $scope.data.year,
        xMax = $scope.settings.xMax,
        taxes = taxData.getTaxes(state, year),
        taxNames = taxData.getTaxNames(state, year),
        fedIncomeIndex = taxNames.indexOf('Federal Income'),
        deductions = [],
        itemized = parseInt($scope.data.itemized, 10),
        capitalize = $filter('capitalize'),
        label,
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

    if (itemized > 0) {
      deductions.push(itemized);
    }

    graph.clear();
    graph.update($scope.settings);

    for (var status in $scope.data.graphLines) {
      if ($scope.data.graphLines[status]) {
        taxes[fedIncomeIndex] = taxService.modifyTaxBracket(
          taxes[fedIncomeIndex], status, deductions
        );

        total = taxService.calcTotalMarginalTaxBrackets(taxes, xMax, status);
        data = taxService.createTakeHomePayData(total, xMax);
        label = 'Net Income - ' + capitalize(status) + ' Status';
        tooltipFn = $scope.createTaxRateFn(total, status, true);
        graph.addLine(data, label, tooltipFn, true);
      }
    }
    
    graph.drawLines();

    primaryTitle = $scope.stateNames[state] + ' Take Home Pay, ' + year;
    secondaryTitle = [
      (deductions.length ? ' Standard Deduction' : 'no deductions'),
      (itemized > 0 ? ', $' + itemized + ' Itemized Deduction' : '')
    ].join(' '); 
    graph.updateTitle(primaryTitle, secondaryTitle);
    $scope.$emit('hideMobileControls');
  };

  $scope.init = function() {
    graph.init();
    $scope.settings.calculateAmount = true;
    $scope.drawGraph();
  };

  taxData.get().then($scope.init);
}

module.exports = TakeHomePayCtrl;