'use strict';

var app = require('../app'),
    d3 = require('d3'),
    lodash = require('lodash'),
    routes = require('./routes'),
    templateCache = require('./templateCache');

// JST.js requires lodash in the global scope
window._ = lodash;

app.constant('d3', d3)
  .constant('_', lodash)
  .constant('JST', window.JST)
  .config(['$provide', 'JST', templateCache])
  .config(['$routeProvider', routes]);
  