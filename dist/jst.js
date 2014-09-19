this["JST"] = this["JST"] || {};

this["JST"]["assets/templates/state-breakdown.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<fieldset>\r\n  <legend>Graph Data</legend>\r\n\r\n  <div>\r\n    <label for="state">State:</label>\r\n    <select ng-model="$root.state" id="state" name="state"\r\n     ng-options="v for v in $root.states">\r\n    </select>\r\n  </div>\r\n\r\n  <div>\r\n    <label for="status">Filing Status:</label>\r\n    <select ng-model="$root.status" id="status" name="status" \r\n     ng-options="v as (v | capitalize) for v in $root.filingStatuses">\r\n    </select>\r\n  </div>\r\n\r\n  <div>\r\n    <div ng-repeat="tax in taxNames">\r\n      {{ tax.type }} {{ tax.name | splitCamelCase }}\r\n    </div>\r\n  </div>\r\n\r\n  <div>\r\n    <label for="graphType">Tax Type:</label>\r\n    <select ng-model="$root.graphType" id="graphType" name="graphType" \r\n     ng-options="v as (v | capitalize) for v in $root.graphTypes">\r\n    </select>\r\n  </div>\r\n</fieldset>\r\n\r\n<fieldset>\r\n  <legend>Graph Settings</legend>\r\n\r\n  <div>\r\n    <label for="y-max">Y Axis Max (%)</label>\r\n    <input type="text" id="y-max" name="y-max" ng-model="$root.yMax">\r\n  </div>\r\n\r\n  <div>\r\n    <label for="x-max">X Axis Max ($)</label>\r\n    <input type="text" id="x-max" name="x-max" ng-model="$root.xMax">\r\n  </div>\r\n\r\n  <div>\r\n    <label for="animation-time">Animation Time</label>\r\n    <input type="text" id="animation-time" name="animation-time" ng-model="$root.animationTime">\r\n  </div>\r\n</fieldset>\r\n\r\n<div class="text-center">\r\n  <button class="pure-button pure-button-primary" ng-click="drawGraph(state, status)">Graph</button>\r\n  <button class="pure-button" ng-click="clearGraph()">Clear</button>\r\n</div>';

}
return __p
};

this["JST"]["assets/templates/state-comparison.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<fieldset>\r\n  <legend>Graph Data</legend>\r\n\r\n  <div>\r\n    <label>States</label>\r\n  </div>\r\n\r\n  <div class="pure-g states">\r\n    <div class="pure-u-1-3" ng-repeat="(key, value) in $root.data.state">\r\n      <input type="checkbox" id="{{ key }}" name="{{ key }}" ng-model="selectedStates[key]">\r\n      <label for="{{ key }}">{{ key }}</label>\r\n    </div>\r\n  </div>\r\n</fieldset>\r\n\r\n<fieldset>\r\n  <legend>Graph Settings</legend>\r\n\r\n  <div>\r\n    <label for="y-max">Y Axis Max (%)</label>\r\n    <input type="text" id="y-max" name="y-max" ng-model="$root.yMax">\r\n  </div>\r\n\r\n  <div>\r\n    <label for="x-max">X Axis Max ($)</label>\r\n    <input type="text" id="x-max" name="x-max" ng-model="$root.xMax">\r\n  </div>\r\n\r\n  <div>\r\n    <label for="animation-time">Animation Time</label>\r\n    <input type="text" id="animation-time" name="animation-time" ng-model="$root.animationTime">\r\n  </div>\r\n</fieldset>\r\n\r\n<div class="text-center">\r\n  <button class="pure-button pure-button-primary" ng-click="$root.drawComparisonGraph(selectedStates, status)">Graph</button>\r\n  <button class="pure-button" ng-click="clearGraph()">Clear</button>\r\n</div>';

}
return __p
};