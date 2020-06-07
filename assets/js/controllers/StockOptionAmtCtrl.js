Number.isNaN = require('is-nan');

/* eslint-disable no-use-before-define */
/* @ngInject */
function StockOptionAmtCtrl($scope, $filter, taxData, taxService, graph, settings) {
  $scope.key = 'stockOptionAmtData';
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

  function rateFormatter(isos, taxAmount) {
    return [
      $filter('currency')(taxAmount, '$', 0),
      `(${$filter('percentage')(taxAmount / $scope.data.income, 2)})`,
    ].join(' ');
  }

  function formatAdjustments() {
    const { deductions, credits } = $scope.data;

    deductions.state.income = deductions.federal.ordinaryIncome;
    credits.state.income = credits.federal.ordinaryIncome;
  }

  function formatItemized() {
    const { deductions } = $scope.data;
    let itemized = parseInt(deductions.itemized, 10);

    itemized = Number.isNaN(itemized) ? 0 : itemized;
    deductions.federal.ordinaryIncome.itemized = itemized;
    deductions.state.income.itemized = itemized;

    return itemized;
  }

  function updateGraphText(state, year) {
    const { axisFormats } = settings;
    const { status, deductions } = $scope.data;
    const { itemized, federal } = deductions;
    const hasDeduction = federal.ordinaryIncome.standardDeduction;

    const primaryTitle = `Federal Ordinary Income Taxes vs AMT, ${year}`;
    const secondaryTitle = [
      `${$filter('splitCamelCase')(status)} Filing Status,`,
      hasDeduction ? ' Standard Deduction' : 'no deductions',
      itemized > 0 ? `, $${itemized} Itemized Deduction` : '',
    ].join(' ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('ISOs Exercised', 'Tax Amount');
    graph.updateAxisFormats(axisFormats.number, axisFormats.dollar);
  }

  function drawGraph() {
    const {
      state,
      year,
      status,
      income,
      strikePrice,
      optionValue,
      deductions: deductionSettings,
      credits: creditSettings,
    } = $scope.data;
    const { xMax } = $scope.settings;

    formatAdjustments();
    formatItemized();
    graph.clear();
    updateGraphText(state, year);
    graph.update($scope.settings);

    const ordinaryIncomeTax = taxData.getFederalOrdinaryIncomeTax(
      state,
      year,
      status,
      deductionSettings,
      creditSettings,
    );
    const ordinaryIncomeTaxRate = taxService.calcEffectiveTaxRate(
      ordinaryIncomeTax.rate,
      income,
      status,
    );
    const ordinaryIncomeTaxAmount = income * ordinaryIncomeTaxRate;
    graph.addLine({
      data: taxData.createFlatTaxData(ordinaryIncomeTaxAmount, xMax),
      label: 'Federal Tax Amount - Ordinary Income',
      tooltipFn: () => ordinaryIncomeTaxAmount,
      formattedFn: rateFormatter,
    });

    const amt = taxData.getFederalAmt(
      state,
      year,
      status,
      deductionSettings,
      creditSettings,
    );
    graph.addLine({
      data: taxData.createStockOptionAmtData(
        amt.rate, income, status, strikePrice, optionValue, xMax,
      ),
      label: 'Federal Tax Amount - AMT',
      tooltipFn: (isos) => taxService.calcAmtTax(
        amt.rate, income, status, strikePrice, optionValue, isos,
      ),
      formattedFn: rateFormatter,
      isInterpolated: true,
    });

    graph.drawLines();
    $scope.$emit('hideMobileControls');
    settings.set($scope.key, $scope.data);
  }
}

export default StockOptionAmtCtrl;
