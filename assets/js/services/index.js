'use strict';

var app = require('../app'),
    taxService = require('./taxService'),
    taxData = require('./taxData');

app.service('taxService', ['_', taxService])
  .service('taxData', ['$http', '$q', 'TAX_API', taxData]);
