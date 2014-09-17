'use strict';

var app = require('../app'),
    capitalize = require('./capitalize');

app.filter('capitalize', capitalize);