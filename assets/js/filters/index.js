'use strict';

var app = require('../app'),
    capitalize = require('./capitalize'),
    splitCamelCase = require('./splitCamelCase');

app.filter('capitalize', capitalize)
  .filter('splitCamelCase', splitCamelCase);