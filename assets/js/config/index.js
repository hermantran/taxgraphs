'use strict';

var app = require('../app'),
    d3 = require('d3'),
    lodash = require('lodash');

app.value('d3', d3)
  .value('_', lodash);