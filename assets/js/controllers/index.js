'use strict';

var app = require('../app'),
    StateComparisonCtrl = require('./StateComparisonCtrl'),
    StateBreakdownCtrl = require('./StateBreakdownCtrl');

app.controller('StateComparisonCtrl', [
  '$scope', 'taxData', 'taxService', 'graph', StateComparisonCtrl
]).controller('StateBreakdownCtrl', [
  '$scope', 'taxData', 'taxService', 'graph', StateBreakdownCtrl
]);