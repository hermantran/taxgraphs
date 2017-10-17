'use strict';

/* @ngInject */
module.exports = function(localStorageService) {
  var service = {};

  service.key = 'taxGraphsSettings';
  service.get = get;
  service.set = set;

  var defaults = {
    stateBreakdownData: {
      state: 'CA',
      year: '2015',
      status: 'single',
      deductions: {
        federal: {
          federalIncome: {
            standardDeduction: true,
            personalExemption: true
          }
        },
        state: {
          income: {
            standardDeduction: true,
            personalExemption: true
          }
        }
      },
      graphLines: {
        effective: true,
        marginal: false,
        totalEffective: true,
        totalMarginal: true
      }
    },
    stateComparisonData: {
      states: {
        CA: true,
        IL: true,
        PA: true,
        NY: true,
        TX: true
      },
      year: '2015',
      status: 'single',
      deductions: {
        federal: {
          federalIncome: {
            standardDeduction: true,
            personalExemption: true
          }
        },
        state: {
          income: {
            standardDeduction: true,
            personalExemption: true
          }
        }
      },
      graphLines: {
        effective: true,
        marginal: false
      }
    },
    takeHomePayData: {
      state: 'CA',
      year: '2015',
      deductions: {
        itemized: 0,
        federal: {
          federalIncome: {
            standardDeduction: true,
            personalExemption: true
          }
        },
        state: {
          income: {
            standardDeduction: true,
            personalExemption: true
          }
        }
      },
      graphLines: {
        single: true,
        married: true
      }
    }
  };
  
  var cache = localStorageService.get(service.key) || defaults;

  function get(key) {
    return cache[key];
  }

  function set(key, value) {
    cache[key] = value;
    localStorageService.set(service.key, cache);
  }

  return service;
};