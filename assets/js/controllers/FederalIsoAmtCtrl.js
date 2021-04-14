Number.isNaN = require('is-nan');

/* eslint-disable no-use-before-define */
/* @ngInject */
function FederalIsoAmtCtrl($scope, $filter, taxData, taxService, graph, settings) {
  $scope.key = 'stockOptionAmtData';
  $scope.xAxisScales = settings.xAxisScales;
  $scope.years = taxData.years;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.stateNames = taxData.stateNames;
  $scope.deductions = taxData.deductions;
  $scope.credits = taxData.credits;
  $scope.addGrant = addGrant;
  $scope.removeGrant = removeGrant;
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
  // and separate out above the line and below the line deductions
  function formatAdjustments() {
    const { deductions, credits } = $scope.data;

    deductions.state.income = deductions.federal.ordinaryIncome;
    credits.state.income = credits.federal.ordinaryIncome;

    const { hasTradRetirement, tradRetirementContribution } = deductions.federal.ordinaryIncome;
    deductions.federal.amt.hasTradRetirement = hasTradRetirement;
    deductions.federal.amt.tradRetirementContribution = tradRetirementContribution;
  }

  function updateGraphText(state, year) {
    const { axisFormats } = settings;
    const {
      status, deductions, stockOptions,
    } = $scope.data;
    const { optionValue, strikePrice } = stockOptions[0];
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
      ...(stockOptions.length > 1
        ? ['Multipe ISO Grants']
        : [
          `${$filter('currency')(optionValue, '$', 2)} 409A`,
          `${$filter('currency')(strikePrice, '$', 2)} Strike Price`,
        ]),
    ].join(', ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('ISOs Exercised', 'Tax Amount');
    graph.updateAxisFormats(axisFormats.number, axisFormats.dollar);
  }

  function displayResults(input, ordinaryIncomeTax, amt) {
    const {
      income, status, stockOptions,
    } = input;
    const { xMax } = $scope.settings;

    const ordinaryIncomeTaxRate = taxService.calcEffectiveTaxRate(
      ordinaryIncomeTax.rate,
      income,
      status,
    );
    const ordinaryIncomeTaxAmount = income * ordinaryIncomeTaxRate;
    const amtIncomeTaxAmount = taxService.calcMultiGrantAmtTax(
      amt.rate, income, status, stockOptions, xMax,
    );
    const amtGrossIncome = taxService.calcMultiGrantAmtIncome(income, stockOptions, xMax);
    const excessAmtTax = Math.max(0, amtIncomeTaxAmount - ordinaryIncomeTaxAmount);

    $scope.results = {
      maxIsos: taxService.calcIsosToAvoidAmt(
        amt.rate,
        income,
        status,
        stockOptions,
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

  function addGrant() {
    $scope.data.stockOptions.push({});
  }

  function removeGrant() {
    $scope.data.stockOptions.pop();
  }

  function drawGraph() {
    const {
      state,
      year,
      status,
      income,
      deductions: deductionSettings,
      credits: creditSettings,
      selfEmployed,
    } = $scope.data;

    let { stockOptions } = $scope.data;
    stockOptions = stockOptions.filter(
      (option) => {
        const keys = Object.keys(option);
        return keys.length > 1 && keys.every((key) => option[key]);
      },
    );

    $scope.settings.xMax = stockOptions.reduce(
      (total, { isoAmount }) => total + isoAmount, 0,
    );
    const { xMax } = $scope.settings;

    formatAdjustments();
    graph.clear();
    updateGraphText(state, year);
    graph.update($scope.settings);

    const ordinaryIncomeTax = taxData.getFederalOrdinaryIncomeTax({
      state,
      year,
      status,
      deductionSettings,
      creditSettings,
      selfEmployed,
    });
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
      alwaysShow: true,
    });

    const amt = taxData.getFederalAmt({
      state, year, status, deductionSettings, creditSettings, selfEmployed,
    });
    graph.addLine({
      data: taxData.createStockOptionAmtData(
        amt.rate,
        income,
        status,
        stockOptions,
        xMax,
      ),
      label: 'Federal Income Tax - AMT',
      tooltipFn: (isos) => taxService.calcMultiGrantAmtTax(
        amt.rate, income, status, stockOptions, isos,
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

export default FederalIsoAmtCtrl;
