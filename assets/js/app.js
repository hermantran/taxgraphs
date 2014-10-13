'use strict';

var angular = require('angular');
require('angular-route/angular-route');
require('angular-local-storage');

module.exports = angular.module('taxApp', ['ngRoute', 'LocalStorageModule']);