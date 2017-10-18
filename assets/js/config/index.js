'use strict';

var app = require('../app'),
    d3 = require('d3'),
    lodash = require('lodash'),
    saveService = require('saveSvgAsPng/saveSvgAsPng'),
    ga = require('ga'),
    routes = require('./routes'),
    rootScope = require('./rootScope'),
    project = require('../../../package.json'),
    domain = project.homepage,
    version = project.version;

app.constant('d3', d3)
  .constant('_', lodash)
  .constant('saveService', saveService)
  .constant('ga', ga)
  .constant('GA_TRACKING_ID', 'UA-55615931-1')
  .constant('TAX_API', 'data/taxes.json?v=' + version)
  .constant('DOMAIN', domain)
  .config(routes)
  .run(rootScope);