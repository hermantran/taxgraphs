Number.isNaN = require('is-nan');

/* eslint-disable no-use-before-define */
/* @ngInject */
function TakeHomePayCtrl($scope, $filter, taxData, taxService, graph, settings) {
  $scope.key = 'takeHomePayData';
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

  // TODO separate out state and federal adjustments into separate fields
  function formatAdjustments() {
    const { deductions, credits } = $scope.data;

    deductions.state.income = deductions.federal.ordinaryIncome;
    credits.state.income = credits.federal.ordinaryIncome;
  }

  function updateGraphText(state, year) {
    const { axisFormats } = settings;
    const { deductions } = $scope.data;
    const { itemizedDeduction, standardDeduction } = deductions.federal.ordinaryIncome;

    const primaryTitle = `${$scope.stateNames[state]} Take Home Pay, ${year}`;
    const secondaryTitle = [
      standardDeduction ? ' Standard Deduction' : 'no deductions',
      itemizedDeduction > 0 ? `, $${itemizedDeduction} Itemized Deduction` : '',
    ].join(' ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('Gross Income', 'Tax Rate');
    graph.updateAxisFormats(axisFormats.dollar, axisFormats.percent);
  }

  function drawGraph() {
    const {
      state,
      year,
      graphLines,
      deductions: deductionSettings,
      credits: creditSettings,
      selfEmployed,
    } = $scope.data;
    const capitalize = $filter('capitalize');
    let { xMax } = $scope.settings;

    xMax = Number.isNaN(xMax) ? graph.defaults.xMax : xMax;

    if ($scope.settings.xAxisScale === settings.xAxisScales.log) {
      $scope.settings.xMin = Math.max($scope.settings.xMin, 1);
      xMax = Math.pow(10, Math.ceil(Math.log10(xMax)));
    }

    formatAdjustments();
    graph.clear();
    updateGraphText(state, year);
    graph.update($scope.settings);

    Object.keys(graphLines).forEach((status) => {
      if (graphLines[status]) {
        const taxes = taxData.getAllTaxes({
          state, year, status, deductionSettings, creditSettings, selfEmployed,
        });
        const total = taxService.calcTotalMarginalTaxBrackets(taxes, xMax, status);

        graph.addLine({
          data: taxData.createTakeHomePayData(
            taxes,
            total,
            xMax,
            status,
            year,
            deductionSettings,
            creditSettings,
          ),
          label: `Net Income - ${capitalize(status)} Status`,
          tooltipFn: createTaxRateFn(taxes, status, true),
          formattedFn: rateFormatter,
          isInterpolated: true,
        });
      }
    });

    graph.drawLines();
    $scope.$emit('hideMobileControls');
    settings.set($scope.key, $scope.data);
  }
}

export default TakeHomePayCtrl;
