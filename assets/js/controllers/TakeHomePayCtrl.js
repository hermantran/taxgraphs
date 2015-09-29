'use strict';

/* @ngInject */
function TakeHomePayCtrl($scope, $filter, taxData, taxService, graph,
 settings) {
  $scope.settings = graph.settings;
  $scope.colors = graph.colors;
  $scope.animationTimes = graph.animationTimes;
  $scope.years = taxData.years;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.stateNames = taxData.stateNames;
  $scope.deductions = taxData.deductions;
  $scope.drawGraph = drawGraph;

  taxData.get().then(init);

  function init() {
    setData();
    graph.init();
    drawGraph();
  }

  function setData() {
    var key = 'takeHomePayData';
    $scope.data = settings.get(key);
  }

  function createTaxRateFn(tax, filingStatus) {
    return function(income) {
      return 1 - taxService.calcEffectiveTaxRate(tax, income, filingStatus);
    };
  }

  function rateFormatter(income, rate) {
    return [
      $filter('currency')(income * rate, '$', 0),
      '(' + $filter('percentage')(rate, 2) + ')'
    ].join(' ');
  }

  function formatItemized() {
    var itemized = parseInt($scope.data.itemized, 10);
    itemized = isNaN(itemized) ? 0 : itemized;
    $scope.data.deductions.itemized = itemized;

    return itemized;
  }

  function updateGraphText(state, year) {
    var data = $scope.data,
        itemized = data.itemized,
        hasDeduction = data.deductions.federal.federalIncome.standardDeduction,
        primaryTitle,
        secondaryTitle;

    primaryTitle = $scope.stateNames[state] + ' Take Home Pay, ' + year;
    secondaryTitle = [
      (hasDeduction ? ' Standard Deduction' : 'no deductions'),
      (itemized > 0 ? ', $' + itemized + ' Itemized Deduction' : '')
    ].join(' '); 
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('Gross Income', 'Percent');
  }

  function drawGraph() {
    var state = $scope.data.state,
        year = $scope.data.year,
        xMax = $scope.settings.xMax,
        graphLines = $scope.data.graphLines,
        deductionSettings = $scope.data.deductions,
        capitalize = $filter('capitalize'),
        rates,
        total;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;

    graph.clear();
    graph.update($scope.settings);
    formatItemized();

    for (var status in graphLines) {
      if (graphLines[status]) {
        rates = taxData.getAllRates(state, year, status, deductionSettings);
        total = taxService.calcTotalMarginalTaxBrackets(rates, xMax, status);

        graph.addLine({
          data: taxService.createTakeHomePayData(total, xMax),
          label: 'Net Income - ' + capitalize(status) + ' Status',
          tooltipFn: createTaxRateFn(total, status, true),
          formattedFn: rateFormatter,
          isInterpolated: true
        });
      }
    }
    
    graph.drawLines();
    updateGraphText(state, year);
    $scope.$emit('hideMobileControls');
  }
}

module.exports = TakeHomePayCtrl;