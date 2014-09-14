'use strict';

var app = require('../app'),
    taxService = require('./taxService');

app.service('taxService', ['_', taxService]);
