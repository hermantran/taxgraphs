angular.module('taxApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('assets/templates/pages/state-breakdown.html',
    "<div class=\"section\"><h3>Data</h3><div ng-include=\"'assets/templates/partials/state-select.html'\"></div><div ng-include=\"'assets/templates/partials/tax-year.html'\"></div><div ng-include=\"'assets/templates/partials/filing-status.html'\"></div><div ng-include=\"'assets/templates/partials/income-max.html'\"></div><div ng-include=\"'assets/templates/partials/graph-lines.html'\" ng-init=\"graphLines = [\r" +
    "\n" +
    "    { id: 'effective-taxes', prop: 'effective', label: 'Effective Taxes' },\r" +
    "\n" +
    "    { id: 'marginal-taxes', prop: 'marginal', label: 'Marginal Taxes' },\r" +
    "\n" +
    "    { id: 'total-effective', prop: 'totalEffective', label: 'Total Effective Tax' },\r" +
    "\n" +
    "    { id: 'total-marginal', prop: 'totalMarginal', label: 'Total Marginal Tax' }\r" +
    "\n" +
    "    ]\"></div><div class=\"subsection\" ng-include=\"'assets/templates/partials/adjustments.html'\"></div><div class=\"subsection\" ng-include=\"'assets/templates/partials/graph-settings.html'\"></div><div ng-include=\"'assets/templates/partials/graph-button.html'\"></div></div>"
  );


  $templateCache.put('assets/templates/pages/state-comparison.html',
    "<div class=\"section\"><h3>Data</h3><div ng-include=\"'assets/templates/partials/state-checkboxes.html'\"></div><div ng-include=\"'assets/templates/partials/tax-year.html'\"></div><div ng-include=\"'assets/templates/partials/filing-status.html'\"></div><div ng-include=\"'assets/templates/partials/income-max.html'\"></div><div ng-include=\"'assets/templates/partials/graph-lines.html'\" ng-init=\"graphLines = [\r" +
    "\n" +
    "    { id: 'effective-taxes', prop: 'effective', label: 'Total Effective Tax' },\r" +
    "\n" +
    "    { id: 'marginal-taxes', prop: 'marginal', label: 'Total Marginal Tax' }\r" +
    "\n" +
    "    ]\"></div><div class=\"subsection\" ng-include=\"'assets/templates/partials/adjustments.html'\"></div><div class=\"subsection\" ng-include=\"'assets/templates/partials/graph-settings.html'\"></div><div ng-include=\"'assets/templates/partials/graph-button.html'\"></div></div>"
  );


  $templateCache.put('assets/templates/pages/state-history.html',
    "<div class=\"section\"><h3>Data</h3><div ng-include=\"'assets/templates/partials/state-select.html'\"></div><div ng-include=\"'assets/templates/partials/filing-status.html'\"></div><div ng-include=\"'assets/templates/partials/income-max.html'\"></div><div ng-include=\"'assets/templates/partials/graph-lines.html'\"></div><div class=\"subsection\" ng-include=\"'assets/templates/partials/adjustments.html'\"></div><div class=\"subsection\" ng-include=\"'assets/templates/partials/graph-settings.html'\"></div><div ng-include=\"'assets/templates/partials/graph-button.html'\"></div></div>"
  );


  $templateCache.put('assets/templates/pages/stock-option-amt.html',
    "<div class=\"section\"><h3>Data</h3><div ng-include=\"'assets/templates/partials/tax-year.html'\"></div><div ng-include=\"'assets/templates/partials/filing-status.html'\"></div><div><label for=\"income\">Gross Income:</label> <input type=\"text\" id=\"income\" name=\"income\" ng-model=\"data.income\" required convert-to-number></div><div><label for=\"exercisedIsos\">ISOs Exercised:</label> <input type=\"text\" id=\"exercisedIsos\" name=\"exercisedIsos\" ng-model=\"settings.xMax\" required convert-to-number></div><div><label for=\"optionValue\">409A Valuation:</label> <input type=\"text\" id=\"optionValue\" name=\"optionValue\" ng-model=\"data.optionValue\" required convert-to-price></div><div><label for=\"strikePrice\">Strike Price:</label> <input type=\"text\" id=\"strikePrice\" name=\"strikePrice\" ng-model=\"data.strikePrice\" required convert-to-price></div><div class=\"subsection\" ng-include=\"'assets/templates/partials/adjustments.html'\"></div><div ng-include=\"'assets/templates/partials/graph-button.html'\"></div></div><div class=\"section\"><h3>Result</h3><div><div class=\"pure-u-1-2\"><strong>Max ISOs to avoid AMT:</strong></div><div class=\"pure-u-1-2 price-line\"><strong>{{ results.maxIsos | currency:'':0 }}</strong></div></div><div><div class=\"pure-u-1-2\">ISOs Exercised:</div><div class=\"pure-u-1-2 price-line\">{{ results.exercisedIsos | currency:'':0 }}</div></div><div><div class=\"pure-u-1-2\">AMT Adjusted Income:</div><div class=\"pure-u-1-2 price-line\">{{ results.amtIncome | currency:'$':0 }}</div></div><div><div class=\"pure-u-1-2\">Adjusted Gross Income:</div><div class=\"pure-u-1-2 price-line\">{{ results.ordinaryIncome | currency:'$':0 }}</div></div><div><div class=\"pure-u-1-2\">AMT Income Tax:</div><div class=\"pure-u-1-2 price-line\">{{ results.amtIncomeTax | currency:'$':0 }}</div></div><div><div class=\"pure-u-1-2\">Ordinary Income Tax:</div><div class=\"pure-u-1-2 price-line\">{{ results.ordinaryIncomeTax | currency:'$':0 }}</div></div><div><div class=\"pure-u-1-2\">Excess AMT Tax:</div><div class=\"pure-u-1-2 price-line\">{{ results.excessAmtTax | currency:'$':0 }}</div></div></div>"
  );


  $templateCache.put('assets/templates/pages/take-home-pay.html',
    "<div class=\"section\"><h3>Data</h3><div ng-include=\"'assets/templates/partials/state-select.html'\"></div><div ng-include=\"'assets/templates/partials/tax-year.html'\"></div><div ng-include=\"'assets/templates/partials/income-max.html'\"></div><div ng-include=\"'assets/templates/partials/graph-lines.html'\" ng-init=\"graphLines = [\r" +
    "\n" +
    "    { id: 'single-income', prop: 'single', label: 'Single Filing Status' },\r" +
    "\n" +
    "    { id: 'married-income', prop: 'married', label: 'Married Filing Status' }\r" +
    "\n" +
    "    ]\"></div><div class=\"subsection\" ng-include=\"'assets/templates/partials/adjustments.html'\"></div><div class=\"subsection\" ng-include=\"'assets/templates/partials/graph-settings.html'\"></div><div ng-include=\"'assets/templates/partials/graph-button.html'\"></div></div>"
  );


  $templateCache.put('assets/templates/partials/adjustments.html',
    "<h3>Adjustments</h3><div><label class=\"valign-top\">Deductions:</label><div class=\"inline-block\"><div ng-repeat=\"deduction in deductions\"><input type=\"checkbox\" name=\"{{ deduction }}\" id=\"{{ deduction }}\" ng-model=\"data.deductions.federal.ordinaryIncome[deduction]\"> <label for=\"{{ deduction }}\">{{ deduction | splitCamelCase }}</label></div><div><input type=\"checkbox\" name=\"tradRetirement\" id=\"tradRetirement\" ng-model=\"data.deductions.federal.ordinaryIncome.hasTradRetirement\"> <label for=\"tradRetirement\">Traditional 401k + IRA</label></div></div></div><div ng-if=\"!data.deductions.federal.ordinaryIncome.standardDeduction\"><label for=\"itemized\" class=\"valign-top\">Itemized<br>Deduction:</label> <input type=\"text\" id=\"itemized\" name=\"itemized\" convert-to-number ng-model=\"data.deductions.federal.ordinaryIncome.itemizedDeduction\"></div><div ng-if=\"data.deductions.federal.ordinaryIncome.hasTradRetirement\"><label for=\"tradRetirementContribution\" class=\"valign-top\">t401k + tIRA<br>Contribution:</label> <input type=\"text\" id=\"tradRetirementContribution\" name=\"tradRetirementContribution\" convert-to-number ng-model=\"data.deductions.federal.ordinaryIncome.tradRetirementContribution\"></div><div ng-if=\"data.deductions.federal.ordinaryIncome.dependents\"><label for=\"dependents\">Dependents:</label> <select id=\"dependents\" name=\"dependents\" ng-model=\"data.deductions.federal.ordinaryIncome.numDependents\" ng-options=\"num as num for num in [0, 1, 2, 3, 4, 5]\"></select></div><div><label class=\"valign-top\">Credits:</label><div class=\"inline-block\"><div ng-repeat=\"credit in credits\"><input type=\"checkbox\" name=\"{{ credit }}\" id=\"{{ credit }}\" ng-model=\"data.credits.federal.ordinaryIncome[credit]\"> <label for=\"{{ credit }}\">{{ credit | splitCamelCase }}</label></div></div></div><div ng-if=\"data.credits.federal.ordinaryIncome.retirementSavers\"><label class=\"valign-top\" for=\"retirement-contribution\">Retirement<br>Contribution:</label> <input type=\"text\" id=\"retirement-contribution\" name=\"retirement-contribution\" ng-model=\"data.credits.federal.ordinaryIncome.retirementContribution\" convert-to-number></div>"
  );


  $templateCache.put('assets/templates/partials/filing-status.html',
    "<div><label for=\"status\">Filing Status:</label> <select ng-model=\"data.status\" id=\"status\" name=\"status\" ng-options=\"v as (v | capitalize) for v in filingStatuses\"></select></div>"
  );


  $templateCache.put('assets/templates/partials/graph-button.html',
    "<div class=\"text-center buttons\"><button class=\"pure-button pure-button-primary\" ng-click=\"drawGraph()\">Graph</button></div>"
  );


  $templateCache.put('assets/templates/partials/graph-lines.html',
    "<div><label class=\"valign-top\">Graph Lines:</label><div class=\"inline-block\"><div ng-repeat=\"graphLine in graphLines\"><input type=\"checkbox\" name=\"{{::graphLine.id}}\" id=\"{{::graphLine.id}}\" ng-model=\"data.graphLines[graphLine.prop]\"> <label for=\"{{::graphLine.id}}\">{{::graphLine.label}}</label></div></div></div>"
  );


  $templateCache.put('assets/templates/partials/graph-settings.html',
    "<h3>Settings</h3><div><label for=\"scale\">X Axis Scale:</label> <select id=\"scale\" name=\"scale\" ng-model=\"settings.xAxisScale\" ng-options=\"val for (key, val) in xAxisScales\"></select></div><!-- <div>\r" +
    "\n" +
    "  <label for=\"animation-time\">Animation Time:</label>\r" +
    "\n" +
    "  <select id=\"animation-time\" name=\"animation-time\" ng-model=\"settings.animationTime\"\r" +
    "\n" +
    "   ng-options=\"time as ((time / 1000) + (time === 1000 ? ' second' : ' seconds')) for time in animationTimes\">\r" +
    "\n" +
    "    </option>\r" +
    "\n" +
    "  </select>\r" +
    "\n" +
    "</div> -->"
  );


  $templateCache.put('assets/templates/partials/income-max.html',
    "<div><label for=\"x-max\">Income Max ($):</label> <input type=\"text\" id=\"x-max\" name=\"x-max\" ng-model=\"settings.xMax\" required convert-to-number></div>"
  );


  $templateCache.put('assets/templates/partials/state-checkboxes.html',
    "<div><label class=\"valign-top\">States:</label><div class=\"inline-block\"><div class=\"state-options\"><input type=\"radio\" name=\"states-selected\" id=\"all-states\" ng-click=\"toggleStates(true)\"> <label for=\"all-states\">All</label> <input type=\"radio\" name=\"states-selected\" id=\"no-states\" ng-click=\"toggleStates(false)\"> <label for=\"no-states\">None</label></div></div><div class=\"states pure-g\"><div class=\"pure-u-1-3 pure-u-xl-1-4\" ng-repeat=\"state in states\"><input type=\"checkbox\" id=\"{{ state }}\" name=\"{{ state }}\" ng-model=\"data.states[state]\"> <label for=\"{{ state }}\">{{ state }}</label></div></div></div>"
  );


  $templateCache.put('assets/templates/partials/state-select.html',
    "<div><label for=\"state\">State:</label> <select ng-model=\"data.state\" id=\"state\" name=\"state\" ng-options=\"v as (stateNames[v]) for v in states\"></select></div>"
  );


  $templateCache.put('assets/templates/partials/tax-year.html',
    "<div><label for=\"year\">Tax Year:</label> <select ng-model=\"data.year\" id=\"year\" name=\"year\" ng-options=\"v as v for v in years\"></select></div>"
  );

}]);
