'use strict';

var app = require('../app'),
    taxService = require('./taxService'),
    taxData = require('./taxData'),
    graph = require('./graph');

app.service('taxService', ['_', taxService])
  .service('taxData', ['$http', '$q', 'TAX_API', taxData])
  .service('graph', ['d3', graph]);
