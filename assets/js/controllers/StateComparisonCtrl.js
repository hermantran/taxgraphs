'use strict';

/* @ngInject */
function StateComparisonCtrl($scope, $filter, taxData, taxService, graph,
 cache) {
  $scope.settings = graph.settings;
  $scope.colors = graph.colors;
  $scope.animationTimes = graph.animationTimes;
  $scope.years = taxData.years;
  $scope.states = taxData.states;
  $scope.filingStatuses = taxData.filingStatuses;
  $scope.deductions = taxData.deductions;
  $scope.toggleState = false;
  $scope.toggleStates = toggleStates;
  $scope.keepUnchecked = keepUnchecked;
  $scope.drawGraph = drawGraph;

  taxData.get().then(init);

  function init() {
    setData();
    graph.init();
    drawGraph();
  }

  function setData() {
    var key = 'stateComparisonData';

    if (!cache.get(key)) {
      cache.set(key, {
        states: {
          CA: true,
          IL: true,
          PA: true,
          NY: true,
          TX: true
        },
        year: taxData.year,
        status: 'single',
        deductions: {
          standardDeduction: true,
          personalExemption: true
        },
        graphLines: {
          effective: true,
          marginal: false
        }
      });
    }

    $scope.data = cache.get(key);
  }

  function toggleStates(bool) {
    var state;
    for (var i = 0, len = $scope.states.length; i < len; i++) {
      state = $scope.states[i];
      $scope.data.states[state] = bool;
    }
  }

  function keepUnchecked() {
    $scope.toggleState = false;
  }

  function createTaxRateFn(tax, filingStatus, isEffective) {
    return function(income) {
      if (isEffective) {
        return taxService.calcEffectiveTaxRate(tax, income, filingStatus);
      } else {
        return taxService.calcMarginalTaxRate(tax, income, filingStatus);
      }
    };
  }

  function rateFormatter(income, rate) {
    return $filter('percentage')(rate, 2);
  }

  function drawGraph() {
    var year = $scope.data.year,
        filingStatus = $scope.data.status,
        xMax = $scope.settings.xMax,
        graphLines = $scope.data.graphLines,
        deductions = [],
        total = [],
        stateNames = [],
        taxNames,
        fedIncomeIndex,
        primaryTitle,
        secondaryTitle,
        taxes;

    xMax = isNaN(xMax) ? graph.defaults.xMax : xMax;

    for (var deduction in $scope.data.deductions) {
      if ($scope.data.deductions[deduction]) {
        deductions.push(taxData.getDeduction(deduction));
      }
    }

    for (var state in $scope.data.states) {
      if ($scope.data.states[state]) {
        stateNames.push(state);
        taxes = taxData.getTaxes(state, year);
        taxNames = taxData.getTaxNames(state, year);
        fedIncomeIndex = taxNames.indexOf('Federal Income');
        taxes[fedIncomeIndex] = taxService.modifyTaxBracket(
          taxes[fedIncomeIndex], filingStatus, deductions
        );

        total.push(taxService.calcTotalMarginalTaxBrackets(
          taxes, xMax, filingStatus
        ));
      }
    }

    graph.clear();
    graph.update($scope.settings);

    for (var i = 0, len = total.length; i < len; i++) {
      if (graphLines.effective) {
        graph.addLine({
          data: taxService.createEffectiveTaxData(total[i], xMax), 
          label: stateNames[i] + ' Effective', 
          tooltipFn: createTaxRateFn(total[i], filingStatus, true),
          formattedFn: rateFormatter,
          isInterpolated: true
        });
      }

      if (graphLines.marginal) {
        graph.addLine({
          data: taxService.createMarginalTaxData(total[i], xMax), 
          label: stateNames[i] + ' Marginal', 
          tooltipFn: createTaxRateFn(total[i], filingStatus),
          formattedFn: rateFormatter,
        });
      }
    }

    graph.drawLines();
    primaryTitle = 'State Income Tax Rates, ' + year;
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

module.exports = StateComparisonCtrl;