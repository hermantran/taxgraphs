this["JST"] = this["JST"] || {};

this["JST"]["assets/templates/state-comparison.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div ng-repeat="(key, value) in $root.data.state">\r\n  <input type="checkbox" id="{{ key }}" name="{{ key }}">\r\n  <label for="{{ key }}">{{ key }}</label>\r\n</div>\r\n\r\n<div class="text-center">\r\n  <button class="pure-button pure-button-primary" ng-click="drawGraph()">Graph</button>\r\n  <button class="pure-button" ng-click="clearGraph()">Clear</button>\r\n</div>';

}
return __p
};