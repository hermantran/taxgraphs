'use strict';

var app = require('../app'),
    taxService = require('./taxService'),
    taxData = require('./taxData'),
    graph = require('./graph'),
    screenService = require('./screenService'),
    cache = require('./cache'),
    tips = require('./tips');

app.service('taxService', taxService)
  .service('taxData', taxData)
  .service('graph', graph)
  .service('screenService', screenService)
  .service('cache', cache)
  .service('tips', tips);