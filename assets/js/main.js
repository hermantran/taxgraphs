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
      $rootScope.graph = new Graph({
        xMax: 150000
      });

      $rootScope.graph.init();
      $rootScope.drawGraph();
    };

    $rootScope.drawGraph = function() {
      var t = $rootScope.data;
      var a = [
        t.federal.income.rate.single,
        t.federal.social_security.rate,
        t.federal.medicare.rate,
        t.state.CA.income.rate.single,
        t.state.CA.SDI.rate,
        t.state.CA.mental_health_services.rate
      ];

      window.a = a;

      for (var i = 0; i < a.length; i++) {
        $rootScope.graph.drawLine(
          taxService.createMarginalTaxData(a[i], $rootScope.graph.xMax
        ));
      }
    };

    $rootScope.clearGraph = function() {
      $rootScope.graph.removeLines();
    };

    $http.get(TAX_API).then($rootScope.initGraph);
  }
]);