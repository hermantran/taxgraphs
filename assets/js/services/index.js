'use strict';

var app = require('../app'),
    taxService = require('./taxService'),
    taxData = require('./taxData'),
    graph = require('./graph'),
    screenService = require('./screenService'),
    cache = require('./cache'),
    tips = require('./tips');

app.service('taxService', ['_', taxService])
  .service('taxData', ['$http', '$q', '$filter', 'TAX_API', taxData])
  .service('graph', ['d3', '_', 'screenService', 'saveService', graph])
  .service('screenService', ['$window', screenService])
  .service('cache', cache)
  .service('tips', ['localStorageService', tips]);