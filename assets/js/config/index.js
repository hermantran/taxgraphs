'use strict';

var app = require('../app'),
    d3 = require('d3'),
    lodash = require('lodash'),
    JST = require('JST'),
    saveService = require('saveSvgAsPng/saveSvgAsPng'),
    routes = require('./routes'),
    templateCache = require('./templateCache'),
    rootScope = require('./rootScope');

// JST.js requires lodash in the global scope
window._ = lodash;

app.constant('d3', d3)
  .constant('_', lodash)
  .constant('JST', JST)
  .constant('saveService', saveService)
  .constant('TAX_API', 'data/2014.json')
  .config(['$provide', 'JST', templateCache])
  .config(['$routeProvider', routes])
  .run(['$rootScope', '$location', rootScope]);