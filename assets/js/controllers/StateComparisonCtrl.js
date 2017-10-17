'use strict';

/* @ngInject */
function StateComparisonCtrl($scope, $filter, taxData, taxService, graph,
 settings) {
  $scope.key = 'stateComparisonData';
  $scope.settings = graph.settings;
  $scope.colors = graph.colors;
  $scope.animationTimes = graph.animationTimes;
  $scope.years = taxData.years;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.deductions = taxData.deductions;
  $scope.toggleState = false;
  $scope.toggleStates = toggleStates;
  $scope.keepUnchecked = keepUnchecked;
  $scope.drawGraph = drawGraph;

  taxData.get().then(init);

  function init() {
    setData();
    graph.init();
    drawGraph();
  }

  function setData() {
    $scope.data = settings.get($scope.key);
  }

  function toggleStates(bool) {
    var state;
    for (var i = 0, len = $scope.states.length; i < len; i++) {
      state = $scope.states[i];
      $scope.data.states[state] = bool;
    }
  }

  function keepUnchecked() {
    $scope.toggleState = false;
  }

  function createTaxRateFn(tax, status, isEffective) {
    var fnProp = isEffective ? 'calcEffectiveTaxRate' : 'calcMarginalTaxRate';

    return function(income) {
      return taxService[fnProp](tax, income, status);
    };
  }

  function rateFormatter(income, rate) {
    return $filter('percentage')(rate, 2);
  }

  function updateGraphText(year, status) {
    var data = $scope.data,
        hasDeduction = data.deductions.federal.federalIncome.standardDeduction,
        primaryTitle,
        secondaryTitle;

    primaryTitle = 'Federal+State Income Tax Rates, ' + year;
    secondaryTitle = [
      $filter('splitCamelCase')(status),
      'Filing Status,',
      (hasDeduction ? ' Standard Deduction' : 'no deductions')
    ].join(' ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('Gross Income', 'Percent');
  }

  function drawGraph() {
    var year = $scope.data.year,
        status = $scope.data.status,
        xMax = $scope.settings.xMax,
        graphLines = $scope.data.graphLines,
        deductionSettings = $scope.data.deductions,
        states = $scope.data.states,
        total,
        rates;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;

    graph.clear();
    graph.update($scope.settings);

    for (var state in states) {
      if (states[state]) {
        rates = taxData.getAllRates(state, year, status, deductionSettings);
        total = taxService.calcTotalMarginalTaxBrackets(rates, xMax, status);

        if (graphLines.effective) {
          graph.addLine({
            data: taxService.createEffectiveTaxData(total, xMax), 
            label: state + ' Effective', 
            tooltipFn: createTaxRateFn(total, status, true),
            formattedFn: rateFormatter,
            isInterpolated: true
          });
        }

        if (graphLines.marginal) {
          graph.addLine({
            data: taxService.createMarginalTaxData(total, xMax), 
            label: state + ' Marginal', 
            tooltipFn: createTaxRateFn(total, status),
            formattedFn: rateFormatter,
          });
        }
      }
    }

    graph.drawLines();
    updateGraphText(year, status);
    $scope.$emit('hideMobileControls');
    settings.set($scope.key, $scope.data);
  }
}

module.exports = StateComparisonCtrl;