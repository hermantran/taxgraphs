'use strict';

var app = require('../app'),
    StateComparisonCtrl = require('./StateComparisonCtrl'),
    StateBreakdownCtrl = require('./StateBreakdownCtrl');

app.controller('StateComparisonCtrl', [
  '$scope', '$rootScope', StateComparisonCtrl
]).controller('StateBreakdownCtrl', [
  '$scope', '$rootScope', StateBreakdownCtrl
]);