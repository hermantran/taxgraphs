'use strict';

module.exports = function($http, $q, TAX_API) {
  var deferred = $q.defer(),
      hasResolved = false;

  this.data = {};
  this.states = [];
  this.filingStatuses = [];
  this.taxTypes = ['effective', 'marginal'];

  this.get = function() {
    if (!hasResolved) {
      this.fetch(TAX_API);
    }

    return deferred.promise;
  };

  this.fetch = function(url) {
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

    for (var filingStatus in data.federal.income.rate) {
      this.filingStatuses.push(filingStatus);
    }
  };

  this.getTaxes = function(state) {
    var taxes = [];

    for (var tax in this.data.federal) {
      taxes.push(this.data.federal[tax].rate);
    }

    for (tax in this.data.state[state]) {
      if (this.data.state[state].hasOwnProperty(tax)) {
        taxes.push(this.data.state[state][tax].rate);
      }
    }

    return taxes;
  };

  this.getTaxNames = function(state) {
    var taxes = [];

    for (var tax in this.data.federal) {
      taxes.push({
        type: 'Federal',
        name: tax
      });
    }

    for (tax in this.data.state[state]) {
      if (this.data.state[state].hasOwnProperty(tax)) {
        taxes.push({
          type: state,
          name: tax
        });
      }
    }

    return taxes;
  };
};