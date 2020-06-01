Number.isNaN = require('is-nan');

/* eslint-disable no-use-before-define */
/* @ngInject */
function StateHistoryCtrl($scope, $filter, taxData, taxService, graph, settings) {
  $scope.key = 'stateHistoryData';
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
    $scope.graphLines = [...$scope.years].reverse().map((year) => ({
      id: year,
      prop: year,
      label: year,
    }));
  };

  function createTotalTaxRateFn(taxes, filingStatus, isEffective) {
    const fnProp = isEffective ? 'calcTotalEffectiveTaxRate' : 'calcTotalMarginalTaxRate';

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

  function updateGraphText(state, status) {
    const { data } = $scope;
    const hasDeduction = data.deductions.federal.federalIncome.standardDeduction;

    const primaryTitle = `${$scope.stateNames[state]} Income Tax Rate History`;
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
    const { status } = $scope.data;
    let { xMax } = $scope.settings;
    const { graphLines } = $scope.data;
    const deductionSettings = $scope.data.deductions;
    const creditSettings = $scope.data.credits;

    xMax = Number.isNaN(xMax) ? graph.defaults.xMax : xMax;

    if ($scope.settings.xAxisScale === settings.xAxisScales.log) {
      $scope.settings.xMin = Math.max($scope.settings.xMin, 1);
      xMax = Math.pow(10, Math.ceil(Math.log10(xMax)));
    }

    formatAdjustments();
    graph.clear();
    graph.update($scope.settings);

    Object.keys(graphLines).forEach((year) => {
      if (!graphLines[year]) {
        return;
      }

      const rates = taxData.getAllRates(state, year, status, deductionSettings, creditSettings);
      const taxes = taxData.getAllTaxes(state, year, status, deductionSettings, creditSettings);
      const total = taxService.calcTotalMarginalTaxBrackets(rates, xMax, status);
      graph.addLine({
        label: year,
        data: taxService.createTotalEffectiveTaxData(taxes, total, xMax, status),
        tooltipFn: createTotalTaxRateFn(taxes, status, true),
        formattedFn: rateFormatter,
        isInterpolated: true,
      });
    });

    graph.drawLines();
    updateGraphText(state, status);
    $scope.$emit('hideMobileControls');
    settings.set($scope.key, $scope.data);
  }
}

export default StateHistoryCtrl;
