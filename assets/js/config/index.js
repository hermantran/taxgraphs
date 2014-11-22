'use strict';

var app = require('../app'),
    d3 = require('d3'),
    lodash = require('lodash'),
    JST = require('JST'),
    saveService = require('saveSvgAsPng/saveSvgAsPng'),
    ga = require('ga'),
    routes = require('./routes'),
    templateCache = require('./templateCache'),
    rootScope = require('./rootScope');

// JST.js requires lodash in the global scope
window._ = lodash;

app.constant('d3', d3)
  .constant('_', lodash)
  .constant('JST', JST)
  .constant('saveService', saveService)
  .constant('ga', ga)
  .constant('GA_TRACKING_ID', 'UA-55615931-1')
  .constant('TAX_API', 'data/2014.json')
  .constant('DOMAIN', 'taxgraphs.io')
  .config(templateCache)
  .config(routes)
  .run(rootScope);