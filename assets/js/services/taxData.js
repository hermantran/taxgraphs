'use strict';

module.exports = function($http, $q, $filter, TAX_API) {
  var hasResolved = false,
      splitCamelCase = $filter('splitCamelCase');

  this.data = {};
  this.states = [];
  this.filingStatuses = [];
  this.taxTypes = ['effective', 'marginal'];

  this.get = function() {
    var deferred = $q.defer();

    if (!hasResolved) {
      this.fetch(TAX_API, deferred);
    } else {
      deferred.resolve(this.data);
    }

    return deferred.promise;
  };

  this.fetch = function(url, deferred) {
    $http.get(url).then(function(resp) {
      this.data = resp.data;
      this.fillMetadata(this.data);
      deferred.resolve(this.data);
      hasResolved = true;
    }.bind(this));
  };

  this.fillMetadata = function(data) {
    for (var state in data.state) {
      this.states.push(state);
    }

    for (var filingStatus in data.federal.taxes.income.rate) {
      this.filingStatuses.push(filingStatus);
    }
  };

  this.getTaxes = function(state) {
    var taxes = [];

    for (var tax in this.data.federal.taxes) {
      taxes.push(this.data.federal.taxes[tax].rate);
    }

    for (tax in this.data.state[state].taxes) {
      if (this.data.state[state].taxes.hasOwnProperty(tax)) {
        taxes.push(this.data.state[state].taxes[tax].rate);
      }
    }

    return taxes;
  };

  this.getTaxNames = function(state) {
    var taxes = [];

    for (var tax in this.data.federal.taxes) {
      taxes.push('Federal ' + splitCamelCase(tax));
    }

    for (tax in this.data.state[state].taxes) {
      if (this.data.state[state].taxes.hasOwnProperty(tax)) {
        taxes.push(state + ' ' + splitCamelCase(tax));
      }
    }

    return taxes;
  };
};