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

  // TODO separate out state and federal adjustments into separate fields
  function formatAdjustments() {
    const { deductions, credits } = $scope.data;

    deductions.state.income = deductions.federal.ordinaryIncome;
    credits.state.income = credits.federal.ordinaryIncome;
  }

  function updateGraphText(state, year, status) {
    const { axisFormats } = settings;
    const { data } = $scope;
    const hasDeduction = data.deductions.federal.ordinaryIncome.standardDeduction;

    const primaryTitle = [
      $scope.stateNames[state],
      'Income Tax Rates,',
      year,
    ].join(' ');
    const secondaryTitle = [
      $filter('splitCamelCase')(status),
      'Filer,',
      hasDeduction ? ' Standard Deduction' : 'no deductions',
    ].join(' ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('Gross Income', 'Tax Rate');
    graph.updateAxisFormats(axisFormats.dollar, axisFormats.percent);
  }

  function drawGraph() {
    const {
      state,
      year,
      status,
      graphLines,
      deductions: deductionSettings,
      credits: creditSettings,
    } = $scope.data;
    const taxes = taxData.getAllTaxes(
      state,
      year,
      status,
      deductionSettings,
      creditSettings,
    );
    let { xMax } = $scope.settings;
    let total;

    xMax = Number.isNaN(xMax) ? graph.defaults.xMax : xMax;

    if ($scope.settings.xAxisScale === settings.xAxisScales.log) {
      $scope.settings.xMin = Math.max($scope.settings.xMin, 1);
      xMax = Math.pow(10, Math.ceil(Math.log10(xMax)));
    }

    formatAdjustments();
    graph.clear();
    updateGraphText(state, year, status);
    graph.update($scope.settings);

    taxes.forEach((tax) => {
      const args = [tax.rate, xMax, status, tax.credits];

      if (graphLines.effective) {
        graph.addLine({
          label: tax.name + (graphLines.marginal ? ' (Effective)' : ''),
          data: taxData.createEffectiveTaxData(...args),
          tooltipFn: createTaxRateFn(tax.rate, status, tax.credits, true),
          formattedFn: rateFormatter,
          isInterpolated: true,
        });
      }

      if (graphLines.marginal) {
        graph.addLine({
          label: tax.name + (graphLines.effective ? ' (Marginal)' : ''),
          data: taxData.createMarginalTaxData(...args),
          tooltipFn: createTaxRateFn(tax.rate, status, tax.credits),
          formattedFn: rateFormatter,
        });
      }
    });

    if (graphLines.totalEffective || graphLines.totalMarginal) {
      total = taxService.calcTotalMarginalTaxBrackets(taxes, xMax, status);
    }

    if (graphLines.totalMarginal) {
      graph.addLine({
        label: 'Total Marginal',
        data: taxData.createTotalMarginalTaxData(taxes, total, xMax, status),
        tooltipFn: createTotalTaxRateFn(taxes, status),
        formattedFn: rateFormatter,
      });
    }

    if (graphLines.totalEffective) {
      graph.addLine({
        label: 'Total Effective',
        data: taxData.createTotalEffectiveTaxData(taxes, total, xMax, status),
        tooltipFn: createTotalTaxRateFn(taxes, status, true),
        formattedFn: rateFormatter,
        isInterpolated: true,
      });
    }

    graph.drawLines();
    $scope.$emit('hideMobileControls');
    settings.set($scope.key, $scope.data);
  }
}

export default StateBreakdownCtrl;
