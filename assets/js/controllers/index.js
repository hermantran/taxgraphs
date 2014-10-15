'use strict';

var app = require('../app'),
    StateComparisonCtrl = require('./StateComparisonCtrl'),
    StateBreakdownCtrl = require('./StateBreakdownCtrl'),
    TakeHomePayCtrl = require('./TakeHomePayCtrl');

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
]).controller('TakeHomePayCtrl', [
  '$scope',
  '$filter',
  'taxData',
  'taxService',
  'graph',
  'cache',
  'tips',
  TakeHomePayCtrl
]);