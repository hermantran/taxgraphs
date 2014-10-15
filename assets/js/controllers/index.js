'use strict';

var app = require('../app'),
    StateComparisonCtrl = require('./StateComparisonCtrl'),
    StateBreakdownCtrl = require('./StateBreakdownCtrl');

app.controller('StateComparisonCtrl', [
  '$scope',
  '$filter',
  'taxData',
  'taxService',
  'graph',
  'cache',
  'tips',
  StateComparisonCtrl
]).controller('StateBreakdownCtrl', [
  '$scope',
  '$filter',
  'taxData',
  'taxService',
  'graph',
  'cache',
  'tips',
  StateBreakdownCtrl
]);