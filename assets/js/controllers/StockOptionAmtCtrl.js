Number.isNaN = require('is-nan');

/* eslint-disable no-use-before-define */
/* @ngInject */
function StockOptionAmtCtrl($scope, $filter, taxData, taxService, graph, settings) {
  $scope.key = 'stockOptionAmtData';
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

  function setData() {
    $scope.data = settings.get($scope.key);
    $scope.settings = $scope.data.graph;
  }

  function createTaxRateFn(tax, filingStatus) {
    return (income) => 1 - taxService.calcTotalEffectiveTaxRate(tax, income, filingStatus);
  }

  function rateFormatter(income, rate) {
    return [$filter('currency')(income * rate, '$', 0), `(${$filter('percentage')(rate, 2)})`].join(
      ' ',
    );
  }

  function formatAdjustments() {
    const { deductions, credits } = $scope.data;

    deductions.state.income = deductions.federal.federalIncome;
    credits.state.income = credits.federal.federalIncome;
  }

  function formatItemized() {
    const { deductions } = $scope.data;
    let itemized = parseInt(deductions.itemized, 10);

    itemized = Number.isNaN(itemized) ? 0 : itemized;
    deductions.federal.federalIncome.itemized = itemized;
    deductions.state.income.itemized = itemized;

    return itemized;
  }

  function updateGraphText(state, year) {
    const { axisFormats } = settings;
    const { data } = $scope;
    const { itemized } = data.deductions;
    const hasDeduction = data.deductions.federal.federalIncome.standardDeduction;

    const primaryTitle = `${$scope.stateNames[state]} Incentive Stock Option AMT, ${year}`;
    const secondaryTitle = [
      hasDeduction ? ' Standard Deduction' : 'no deductions',
      itemized > 0 ? `, $${itemized} Itemized Deduction` : '',
    ].join(' ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('ISOs Exercised', 'Taxes');
    graph.updateAxisFormats(axisFormats.number, axisFormats.dollar);
  }

  function drawGraph() {
    const {
      state,
      year,
      deductions: deductionSettings,
      credits: creditSettings,
    } = $scope.data;
    const capitalize = $filter('capitalize');
    let { xMax } = $scope.settings;

    xMax = Number.isNaN(xMax) ? graph.defaults.xMax : xMax;

    if ($scope.settings.xAxisScale === settings.xAxisScales.log) {
      $scope.settings.xMin = Math.max($scope.settings.xMin, 1);
      xMax = Math.pow(10, Math.ceil(Math.log10(xMax)));
    }

    formatAdjustments();
    formatItemized();
    graph.clear();
    updateGraphText(state, year);
    graph.update($scope.settings);

    const status = 'single';
    const rates = taxData.getAllRates(state, year, status, deductionSettings, creditSettings);
    const taxes = taxData.getAllTaxes(state, year, status, deductionSettings, creditSettings);
    const total = taxService.calcTotalMarginalTaxBrackets(rates, xMax, status);

    graph.addLine({
      data: taxService.createTakeHomePayData(taxes, total, xMax, status),
      label: `Net Income - ${capitalize(status)} Status`,
      tooltipFn: createTaxRateFn(taxes, status, true),
      formattedFn: rateFormatter,
      isInterpolated: true,
    });

    graph.drawLines();
    $scope.$emit('hideMobileControls');
    settings.set($scope.key, $scope.data);
  }
}

export default StockOptionAmtCtrl;
