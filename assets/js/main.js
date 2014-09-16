'use strict';

var app = require('./app');
require('./config');
require('./directives');
require('./factories');
require('./services');
require('./controllers');

app.run([
  '$rootScope',
  '$http',
  'Graph', 
  'taxService',
  'TAX_API',
  function($rootScope, $http, Graph, taxService, TAX_API) {
    $rootScope.initGraph = function(resp) {
      $rootScope.data = resp.data;
      window.d = $rootScope.data;

      $rootScope.states = [];
      $rootScope.filingStatuses = [];
      $rootScope.graphTypes = ['effective', 'marginal'];
      $rootScope.xMax = 100000;

      for (var state in $rootScope.data.state) {
        $rootScope.states.push(state);
      }

      for (var filingStatus in $rootScope.data.federal.income.rate) {
        $rootScope.filingStatuses.push(filingStatus);
      }

      $rootScope.graph = new Graph({
        xMax: $rootScope.xMax
      });

      window.d = resp.data;

      $rootScope.state = 'CA';
      $rootScope.status = 'single';
      $rootScope.graphType = 'effective';

      $rootScope.graph.init();
      $rootScope.drawGraph($rootScope.state, $rootScope.status);
    };

    $rootScope.drawGraph = function(state, filingStatus) {
      var t = $rootScope.data,
          taxes = [],
          tax,
          data;

      for (tax in t.federal) {
        taxes.push(t.federal[tax].rate);
      }

      for (tax in t.state[state]) {
        if (t.state[state].hasOwnProperty(tax)) {
          taxes.push(t.state[state][tax].rate);
        }
      }

      $rootScope.graph.updateXAxis($rootScope.xMax);
      $rootScope.clearGraph();

      console.log($rootScope.graphType);

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

        
        // console.log(taxes[i], data);
      }
    };

    $rootScope.clearGraph = function() {
      $rootScope.graph.removeLines();
    };

    $http.get(TAX_API).then($rootScope.initGraph);
  }
]);