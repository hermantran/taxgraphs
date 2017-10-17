'use strict';

/* @ngInject */
function StateBreakdownCtrl($scope, $filter, taxData, taxService, graph,
 settings) {
  $scope.key = 'stateBreakdownData';
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
    $scope.data = settings.get($scope.key);
  }

  function createTaxRateFn(tax, filingStatus, isEffective) {
    var fnProp = isEffective ? 'calcEffectiveTaxRate' : 'calcMarginalTaxRate';

    return function(income) {
      return taxService[fnProp](tax, income, filingStatus);
    };
  }

  function rateFormatter(income, rate) {
    return $filter('percentage')(rate, 2);
  }

  function updateGraphText(state, year, status) {
    var data = $scope.data,
        hasDeduction = data.deductions.federal.federalIncome.standardDeduction,
        primaryTitle,
        secondaryTitle;

    primaryTitle = [
      $scope.stateNames[state],
      'Income Tax Rates,',
      year
    ].join(' ');
    secondaryTitle = [
      $filter('splitCamelCase')(status),
      'Filing Status,',
      (hasDeduction ? ' Standard Deduction' : 'no deductions')
    ].join(' ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('Gross Income', 'Percent');
  }

  function drawGraph() {
    var state = $scope.data.state,
        year = $scope.data.year,
        status = $scope.data.status,
        xMax = $scope.settings.xMax,
        graphLines = $scope.data.graphLines,
        deductionSettings = $scope.data.deductions,
        rates = taxData.getAllRates(state, year, status, deductionSettings),
        taxes = taxData.getAllTaxes(state, year, status, deductionSettings),
        total,
        args;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;

    graph.clear();
    graph.update($scope.settings);

    taxes.forEach(function(tax) {
      args = [tax.rate, xMax, status];

      if (graphLines.effective) {
        graph.addLine({
          label: tax.name + (graphLines.marginal ? ' (E)' : ''),
          data: taxService.createEffectiveTaxData.apply(taxService, args),
          tooltipFn: createTaxRateFn(tax.rate, status, true),
          formattedFn: rateFormatter,
          isInterpolated: true
        });
      }

      if (graphLines.marginal) {
        graph.addLine({
          label: tax.name + (graphLines.effective ? ' (M)' : ''),
          data: taxService.createMarginalTaxData.apply(taxService, args),
          tooltipFn: createTaxRateFn(tax.rate, status),
          formattedFn: rateFormatter,
        });
      }
    });

    if (graphLines.totalEffective || graphLines.totalMarginal) {
      total = taxService.calcTotalMarginalTaxBrackets(rates, xMax, status);
    }

    if (graphLines.totalMarginal) {
      graph.addLine({
        label: 'Total Marginal',
        data: taxService.createMarginalTaxData(total, xMax),
        tooltipFn: createTaxRateFn(total, status),
        formattedFn: rateFormatter,
      });
    }

    if (graphLines.totalEffective) {
      graph.addLine({
        label: 'Total Effective',
        data: taxService.createEffectiveTaxData(total, xMax),
        tooltipFn: createTaxRateFn(total, status, true),
        formattedFn: rateFormatter,
        isInterpolated: true
      });
    }

    graph.drawLines();
    updateGraphText(state, year, status);
    $scope.$emit('hideMobileControls');
    settings.set($scope.key, $scope.data);
  }
}

module.exports = StateBreakdownCtrl;