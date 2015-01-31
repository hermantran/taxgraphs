'use strict';

var app = require('../app'),
    d3 = require('d3'),
    lodash = require('lodash'),
    JST = require('JST'),
    saveService = require('saveSvgAsPng/saveSvgAsPng'),
    ga = require('ga'),
    routes = require('./routes'),
    rootScope = require('./rootScope'),
    domain = require('../../../package.json').homepage;

app.constant('d3', d3)
  .constant('_', lodash)
  .constant('JST', JST)
  .constant('saveService', saveService)
  .constant('ga', ga)
  .constant('GA_TRACKING_ID', 'UA-55615931-1')
  .constant('TAX_API', 'data/2014.json')
  .constant('DOMAIN', domain)
  .config(routes)
  .run(rootScope);