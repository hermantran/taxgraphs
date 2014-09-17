'use strict';

var app = require('./app');
require('./config');
require('./filters');
require('./directives');
require('./factories');
require('./services');
require('./controllers');

app.run([
  '$rootScope',
  'Graph', 
  'taxService',
  'taxData',
  function($rootScope, Graph, taxService, taxData) {
    $rootScope.initGraph = function(data) {
      $rootScope.data = data;
      window.d = $rootScope.data;

      $rootScope.states = taxData.states;
      $rootScope.filingStatuses = taxData.filingStatuses;
      $rootScope.graphTypes = taxData.taxTypes;
      $rootScope.xMax = 100000;

      $rootScope.graph = new Graph({
        xMax: $rootScope.xMax
      });

      $rootScope.state = 'CA';
      $rootScope.status = 'single';
      $rootScope.graphType = 'effective';

      $rootScope.graph.init();
      $rootScope.taxNames = taxData.getTaxNames($rootScope.state);
      $rootScope.drawGraph($rootScope.state, $rootScope.status);
    };

    $rootScope.drawGraph = function(state, filingStatus) {
      var taxes = taxData.getTaxes(state),
          data;

      $rootScope.graph.updateXAxis($rootScope.xMax);
      $rootScope.clearGraph();

      for (var i = 0; i < taxes.length; i++) {
        var args = [
          taxes[i], 
          $rootScope.graph.xMax, 
          filingStatus
        ];

        if ($rootScope.graphType === 'effective') {
          data = taxService.createEffectiveTaxData.apply(taxService, args);
          $rootScope.graph.drawLine(data, true);
        } else {
          data = taxService.createMarginalTaxData.apply(taxService, args);
          $rootScope.graph.drawLine(data);
        }
      }
    };

    $rootScope.clearGraph = function() {
      $rootScope.graph.removeLines();
    };

    taxData.get().then($rootScope.initGraph);
  }
]);