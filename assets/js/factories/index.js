'use strict';

var app = require('../app'),
    Graph = require('./Graph');

app.factory('Graph', ['d3', Graph]);
