import angular from './lib/angular';
import 'angular-route/angular-route';
import 'angular-local-storage';

export default angular.module('taxApp', ['ngRoute', 'LocalStorageModule']);
