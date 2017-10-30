'use strict';

/* @ngInject */
function StateComparisonCtrl($scope, $filter, taxData, taxService, graph,
 settings) {
  $scope.key = 'stateComparisonData';
  $scope.colors = settings.colors;
  $scope.animationTimes = settings.animationTimes;
  $scope.xAxisScales = settings.xAxisScales;
  $scope.years = taxData.years;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.deductions = taxData.deductions;
  $scope.credits = taxData.credits;
  $scope.toggleStates = toggleStates;
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

  function toggleStates(bool) {
    var state;
    for (var i = 0, len = $scope.states.length; i < len; i++) {
      state = $scope.states[i];
      $scope.data.states[state] = bool;
    }
  }

  function createTaxRateFn(taxes, status, isEffective) {
    var fnProp = isEffective ? 'calcTotalEffectiveTaxRate' :
      'calcTotalMarginalTaxRate';

    return function(income) {
      return taxService[fnProp](taxes, income, status);
    };
  }

  function rateFormatter(income, rate) {
    return $filter('percentage')(rate, 2);
  }

  function formatAdjustments() {
    var deductions = $scope.data.deductions,
        credits = $scope.data.credits;

    deductions.state.income = deductions.federal.federalIncome;
    credits.state.income = credits.federal.federalIncome;
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
        creditSettings = $scope.data.credits,
        states = $scope.data.states,
        total,
        taxes,
        rates;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;

    if ($scope.settings.xAxisScale === settings.xAxisScales.log) {
      $scope.settings.xMin = Math.max($scope.settings.xMin, 1);
      xMax = Math.pow(10, Math.ceil(Math.log10(xMax)));
    }

    formatAdjustments();
    graph.clear();
    graph.update($scope.settings);

    for (var state in states) {
      if (states[state]) {
        rates = taxData.getAllRates(
          state, year, status, deductionSettings, creditSettings
        );
        taxes = taxData.getAllTaxes(
          state, year, status, deductionSettings, creditSettings
        );
        total = taxService.calcTotalMarginalTaxBrackets(rates, xMax, status);

        if (graphLines.effective) {
          graph.addLine({
            data: taxService.createTotalEffectiveTaxData(
              taxes, total, xMax, status
            ), 
            label: state + ' Effective', 
            tooltipFn: createTaxRateFn(taxes, status, true),
            formattedFn: rateFormatter,
            isInterpolated: true
          });
        }

        if (graphLines.marginal) {
          graph.addLine({
            data: taxService.createTotalMarginalTaxData(
              taxes, total, xMax, status
            ),
            label: state + ' Marginal', 
            tooltipFn: createTaxRateFn(taxes, status),
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