'use strict';

/* @ngInject */
module.exports = function(APP_NAME, APP_VERSION, TAX_YEAR,
 localStorageService, _) {
  var service = {};

  service.key = APP_NAME + 'Settings' + APP_VERSION;
  service.get = get;
  service.set = set;

  service.animationTimes = [0, 1000, 2000, 3000];
  service.xAxisScales = {
    linear: 'Linear',
    log: 'Logarithmic'
  };

  service.graphDefaults = {
    xAxisScale: service.xAxisScales.linear,
    xMin: 0,
    xMax: 300000,
    yMin: 0,
    yMax: 60,
    animationTime: 2000
  };

  var defaults = {
    stateBreakdownData: {
      state: 'CA',
      year: TAX_YEAR,
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
      },
      graph: createGraphSettings()
    },
    stateComparisonData: {
      states: {
        CA: true,
        IL: true,
        PA: true,
        NY: true,
        TX: true
      },
      year: TAX_YEAR,
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
      },
      graph: createGraphSettings()
    },
    takeHomePayData: {
      state: 'CA',
      year: TAX_YEAR,
      deductions: {
        federal: {
          federalIncome: {
            itemized: 0,
            standardDeduction: true,
            personalExemption: true
          }
        },
        state: {
          income: {
            itemized: 0,
            standardDeduction: true,
            personalExemption: true
          }
        }
      },
      graphLines: {
        single: true,
        married: true
      },
      graph: createGraphSettings()
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

  function createGraphSettings() {
    return Object.assign(_.cloneDeep(service.graphDefaults));
  }

  return service;
};