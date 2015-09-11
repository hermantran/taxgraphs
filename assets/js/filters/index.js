'use strict';

var app = require('../app'),
    capitalize = require('./capitalize'),
    percentage = require('./percentage'),
    splitCamelCase = require('./splitCamelCase');

app.filter('capitalize', capitalize)
  .filter('percentage', percentage)
  .filter('splitCamelCase', splitCamelCase);