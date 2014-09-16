'use strict';

var app = require('../app'),
    d3 = require('d3'),
    lodash = require('lodash'),
    JST = require('JST'),
    routes = require('./routes'),
    templateCache = require('./templateCache');

// JST.js requires lodash in the global scope
window._ = lodash;

app.constant('d3', d3)
  .constant('_', lodash)
  .constant('JST', JST)
  .constant('TAX_API', 'dist/data/taxes.json')
  .config(['$provide', 'JST', templateCache])
  .config(['$routeProvider', routes]);
  