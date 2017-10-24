'use strict';

/* @ngInject */
function TakeHomePayCtrl($scope, $filter, taxData, taxService, graph,
 settings) {
  $scope.key = 'takeHomePayData';
  $scope.colors = settings.colors;
  $scope.animationTimes = settings.animationTimes;
  $scope.xAxisScales = settings.xAxisScales;
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
    $scope.data = settings.get($scope.key);
    $scope.settings = $scope.data.graph;
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

  function formatDeductions() {
    var deductions = $scope.data.deductions;
    deductions.state.income = deductions.federal.federalIncome;
  }

  function formatItemized() {
    var deductions = $scope.data.deductions,
        itemized = parseInt(deductions.itemized, 10);

    itemized = isNaN(itemized) ? 0 : itemized;
    deductions.federal.federalIncome.itemized = itemized;
    deductions.state.income.itemized = itemized;

    return itemized;
  }

  function updateGraphText(state, year) {
    var data = $scope.data,
        itemized = data.deductions.itemized,
        hasDeduction = data.deductions.federal.federalIncome.standardDeduction,
        primaryTitle,
        secondaryTitle;

    primaryTitle = $scope.stateNames[state] + ' Take Home Pay, ' + year;
    secondaryTitle = [
      (hasDeduction ? ' Standard Deduction' : 'no deductions'),
      (itemized > 0 ? ', $' + itemized + ' Itemized Deduction' : '')
    ].join(' '); 
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('Adjusted Gross Income', 'Percent');
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

    if ($scope.settings.xAxisScale === settings.xAxisScales.log) {
      $scope.settings.xMin = Math.max($scope.settings.xMin, 1);
      xMax = Math.pow(10, Math.ceil(Math.log10(xMax)));
    }

    formatDeductions();
    formatItemized();
    graph.clear();
    graph.update($scope.settings);

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
    settings.set($scope.key, $scope.data);
  }
}

module.exports = TakeHomePayCtrl;