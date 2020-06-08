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

  // TODO separate out state and federal adjustments into separate fields
  function formatAdjustments() {
    const { deductions, credits } = $scope.data;

    deductions.state.income = {
      ...deductions.federal.ordinaryIncome,
      itemizedDeduction: 0,
      tradRetirementContribution: 0,
    };
    credits.state.income = credits.federal.ordinaryIncome;
  }

  function updateGraphText(state, year) {
    const { axisFormats } = settings;
    const {
      status, deductions, optionValue, strikePrice,
    } = $scope.data;
    const {
      itemizedDeduction,
      standardDeduction,
      hasTradRetirement,
      tradRetirementContribution,
    } = deductions.federal.ordinaryIncome;

    const primaryTitle = `Federal Income Tax - Ordinary Income vs AMT, ${year}`;
    const secondaryTitle = [
      `${$filter('splitCamelCase')(status)} Filer`,
      standardDeduction
        ? 'Standard Deduction'
        : `${$filter('currency')(itemizedDeduction / 1000, '$', 0)}k Itemized Deduction`,
      ...(hasTradRetirement ? [
        `${$filter('currency')(tradRetirementContribution / 1000, '$', 0)}k t401k + tIRA`,
      ] : []),
      `${$filter('currency')(optionValue, '$', 2)} 409A`,
      `${$filter('currency')(strikePrice, '$', 2)} Strike Price`,
    ].join(', ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('ISOs Exercised', 'Tax Amount');
    graph.updateAxisFormats(axisFormats.number, axisFormats.dollar);
  }

  function displayResults(input, ordinaryIncomeTax, amt) {
    const {
      income, status, strikePrice, optionValue,
    } = input;
    const { xMax } = $scope.settings;

    const ordinaryIncomeTaxRate = taxService.calcEffectiveTaxRate(
      ordinaryIncomeTax.rate,
      income,
      status,
    );
    const ordinaryIncomeTaxAmount = income * ordinaryIncomeTaxRate;
    const amtIncomeTaxAmount = taxService.calcAmtTax(
      amt.rate, income, status, strikePrice, optionValue, xMax,
    );
    const amtGrossIncome = taxService.calcAmtIncome(income, strikePrice, optionValue, xMax);
    const excessAmtTax = Math.max(0, amtIncomeTaxAmount - ordinaryIncomeTaxAmount);

    $scope.results = {
      maxIsos: taxService.calcIsosToAvoidAmt(
        amt.rate,
        income,
        status,
        strikePrice,
        optionValue,
        ordinaryIncomeTaxAmount,
      ),
      exercisedIsos: xMax,
      ordinaryIncome: income - taxService.calcDeductionFromTaxBracket(ordinaryIncomeTax.rate),
      amtIncome: amtGrossIncome - taxService.calcDeductionFromTaxBracket(amt.rate),
      ordinaryIncomeTax: ordinaryIncomeTaxAmount,
      amtIncomeTax: amtIncomeTaxAmount,
      excessAmtTax,
    };
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
      label: 'Federal Income Tax - Ordinary Income',
      tooltipFn: () => ordinaryIncomeTaxAmount,
      formattedFn: rateFormatter,
    });

    const amt = taxData.getFederalAmt(state, year, status, deductionSettings, creditSettings);
    graph.addLine({
      data: taxData.createStockOptionAmtData(
        amt.rate,
        income,
        status,
        strikePrice,
        optionValue,
        xMax,
      ),
      label: 'Federal Income Tax - AMT',
      tooltipFn: (isos) => taxService.calcAmtTax(
        amt.rate, income, status, strikePrice, optionValue, isos,
      ),
      formattedFn: rateFormatter,
      isInterpolated: true,
      alwaysShow: true,
    });

    displayResults({ ...$scope.data }, ordinaryIncomeTax, amt);
    graph.drawLines();
    $scope.$emit('hideMobileControls');
    settings.set($scope.key, $scope.data);
  }
}

export default StockOptionAmtCtrl;
