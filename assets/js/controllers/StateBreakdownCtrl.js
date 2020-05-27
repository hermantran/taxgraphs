Number.isNaN = require('is-nan');

/* eslint-disable no-use-before-define */
/* @ngInject */
function StateBreakdownCtrl(
  $scope,
  $filter,
  taxData,
  taxService,
  graph,
  settings,
) {
  $scope.key = 'stateBreakdownData';
  $scope.colors = settings.colors;
  $scope.animationTimes = settings.animationTimes;
  $scope.xAxisScales = settings.xAxisScales;
  $scope.years = taxData.years;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.stateNames = taxData.stateNames;
  $scope.deductions = taxData.deductions;
  $scope.credits = taxData.credits;
  $scope.drawGraph = drawGraph;

  taxData.get().then(init);

  function init() {
    setData();
    graph.init();
    drawGraph();
  }

  const setData = () => {
    $scope.data = settings.get($scope.key);
    $scope.settings = $scope.data.graph;
  };

  function createTaxRateFn(tax, filingStatus, credits, isEffective) {
    const fnProp = isEffective ? 'calcEffectiveTaxRate' : 'calcMarginalTaxRate';

    return (income) => taxService[fnProp](tax, income, filingStatus, credits);
  }

  function createTotalTaxRateFn(taxes, filingStatus, isEffective) {
    const fnProp = isEffective
      ? 'calcTotalEffectiveTaxRate'
      : 'calcTotalMarginalTaxRate';

    return (income) => taxService[fnProp](taxes, income, filingStatus);
  }

  function rateFormatter(income, rate) {
    return $filter('percentage')(rate, 2);
  }

  function formatAdjustments() {
    const { deductions } = $scope.data;
    const { credits } = $scope.data;

    deductions.state.income = deductions.federal.federalIncome;
    credits.state.income = credits.federal.federalIncome;
  }

  function updateGraphText(state, year, status) {
    const { data } = $scope;
    const hasDeduction = data.deductions.federal.federalIncome.standardDeduction;

    const primaryTitle = [
      $scope.stateNames[state],
      'Income Tax Rates,',
      year,
    ].join(' ');
    const secondaryTitle = [
      $filter('splitCamelCase')(status),
      'Filing Status,',
      hasDeduction ? ' Standard Deduction' : 'no deductions',
    ].join(' ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('Gross Income', 'Percent');
  }

  function drawGraph() {
    const { state } = $scope.data;
    const { year } = $scope.data;
    const { status } = $scope.data;
    let { xMax } = $scope.settings;
    const { graphLines } = $scope.data;
    const deductionSettings = $scope.data.deductions;
    const creditSettings = $scope.data.credits;
    const rates = taxData.getAllRates(
      state,
      year,
      status,
      deductionSettings,
      creditSettings,
    );
    const taxes = taxData.getAllTaxes(
      state,
      year,
      status,
      deductionSettings,
      creditSettings,
    );
    let total;
    let args;

    xMax = Number.isNaN(xMax) ? graph.defaults.xMax : xMax;

    if ($scope.settings.xAxisScale === settings.xAxisScales.log) {
      $scope.settings.xMin = Math.max($scope.settings.xMin, 1);
      xMax = Math.pow(10, Math.ceil(Math.log10(xMax)));
    }

    formatAdjustments();
    graph.clear();
    graph.update($scope.settings);

    taxes.forEach((tax) => {
      args = [tax.rate, xMax, status, tax.credits];

      if (graphLines.effective) {
        graph.addLine({
          label: tax.name + (graphLines.marginal ? ' (E)' : ''),
          data: taxService.createEffectiveTaxData(...args),
          tooltipFn: createTaxRateFn(tax.rate, status, tax.credits, true),
          formattedFn: rateFormatter,
          isInterpolated: true,
        });
      }

      if (graphLines.marginal) {
        graph.addLine({
          label: tax.name + (graphLines.effective ? ' (M)' : ''),
          data: taxService.createMarginalTaxData(...args),
          tooltipFn: createTaxRateFn(tax.rate, status, tax.credits),
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
        data: taxService.createTotalMarginalTaxData(taxes, total, xMax, status),
        tooltipFn: createTotalTaxRateFn(taxes, status),
        formattedFn: rateFormatter,
      });
    }

    if (graphLines.totalEffective) {
      graph.addLine({
        label: 'Total Effective',
        data: taxService.createTotalEffectiveTaxData(
          taxes,
          total,
          xMax,
          status,
        ),
        tooltipFn: createTotalTaxRateFn(taxes, status, true),
        formattedFn: rateFormatter,
        isInterpolated: true,
      });
    }

    graph.drawLines();
    updateGraphText(state, year, status);
    $scope.$emit('hideMobileControls');
    settings.set($scope.key, $scope.data);
  }
}

module.exports = StateBreakdownCtrl;
