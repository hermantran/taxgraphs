'use strict';

var app = require('./app');
require('./config');
require('./directives');
require('./factories');
require('./services');
require('./controllers');

app.run(['Graph', function(Graph) {
  var graph = new Graph();
  graph.init();
}]);