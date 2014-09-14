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
  function($rootScope, $http, Graph, taxService) {

    function testGraph(data) {
      var t = data;
      var graph = new Graph({
        xMax: 1200000
      });
      graph.init();

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
        graph.drawLine(taxService.createMarginalTaxData(a[i], graph.xMax));
      }
    }

    $http.get('dist/data/taxes.json').then(function(resp) {
      $rootScope.data = resp.data;
      testGraph($rootScope.data);
    });
  }
]);