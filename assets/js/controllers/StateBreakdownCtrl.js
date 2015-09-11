'use strict';

/* @ngInject */
function StateBreakdownCtrl($scope, $filter, taxData, taxService, graph,
 cache) {
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
    var key = 'stateBreakdownData';

    if (!cache.get(key)) {
      cache.set(key, {
        state: 'CA',
        year: taxData.year,
        status: 'single',
        deductions: {
          standardDeduction: true,
          personalExemption: true
        },
        graphLines: {
          effective: true,
          marginal: false,
          totalEffective: true,
          totalMarginal: true
        }
      });
    }

    $scope.data = cache.get(key);
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

  function drawGraph() {
    var state = $scope.data.state,
        year = $scope.data.year,
        filingStatus = $scope.data.status,
        xMax = $scope.settings.xMax,
        graphLines = $scope.data.graphLines,
        taxes = taxData.getTaxes(state, year),
        taxNames = taxData.getTaxNames(state, year),
        fedIncomeIndex = taxNames.indexOf('Federal Income'),
        deductions = [],
        primaryTitle,
        secondaryTitle,
        total,
        args;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;

    for (var deduction in $scope.data.deductions) {
      if ($scope.data.deductions[deduction]) {
        deductions.push(taxData.getDeduction(deduction));
      }
    }

    taxes[fedIncomeIndex] = taxService.modifyTaxBracket(
      taxes[fedIncomeIndex], filingStatus, deductions
    );

    if (graphLines.totalEffective || graphLines.totalMarginal) {
      total = taxService.calcTotalMarginalTaxBrackets(
        taxes, xMax, filingStatus
      );
    }

    graph.clear();
    graph.update($scope.settings);

    for (var i = 0; i < taxes.length; i++) {
      args = [taxes[i], xMax, filingStatus];

      if (graphLines.effective) {
        graph.addLine({
          label: taxNames[i] + (graphLines.marginal ? ' (E)' : ''),
          data: taxService.createEffectiveTaxData.apply(taxService, args),
          tooltipFn: createTaxRateFn(taxes[i], filingStatus, true),
          formattedFn: rateFormatter,
          isInterpolated: true
        });
      }

      if (graphLines.marginal) {
        graph.addLine({
          label: taxNames[i] + (graphLines.effective ? ' (M)' : ''),
          data: taxService.createMarginalTaxData.apply(taxService, args),
          tooltipFn: createTaxRateFn(taxes[i], filingStatus),
          formattedFn: rateFormatter,
        });
      }
    }

    if (graphLines.totalMarginal) {
      graph.addLine({
        label: 'Total Marginal',
        data: taxService.createMarginalTaxData(total, xMax),
        tooltipFn: createTaxRateFn(total, filingStatus),
        formattedFn: rateFormatter,
      });
    }

    if (graphLines.totalEffective) {
      graph.addLine({
        label: 'Total Effective',
        data: taxService.createEffectiveTaxData(total, xMax),
        tooltipFn: createTaxRateFn(total, filingStatus, true),
        formattedFn: rateFormatter,
        isInterpolated: true
      });
    }

    graph.drawLines();
    primaryTitle = [
      $scope.stateNames[state],
      'Income Tax Rates,',
      year
    ].join(' ');
    secondaryTitle = [
      $filter('splitCamelCase')(filingStatus),
      'Filing Status,',
      (deductions.length ? ' Standard Deduction' : 'no deductions')
    ].join(' ');
    graph.updateTitle(primaryTitle, secondaryTitle);
    graph.updateAxisLabels('Gross Income', 'Percent');
    $scope.$emit('hideMobileControls');
  }
}

module.exports = StateBreakdownCtrl;