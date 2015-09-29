'use strict';

var app = require('../app'),
    taxService = require('./taxService'),
    taxData = require('./taxData'),
    graph = require('./graph'),
    screenService = require('./screenService'),
    settings = require('./settings'),
    tips = require('./tips');

app.service('taxService', taxService)
  .service('taxData', taxData)
  .service('graph', graph)
  .service('screenService', screenService)
  .service('settings', settings)
  .service('tips', tips);