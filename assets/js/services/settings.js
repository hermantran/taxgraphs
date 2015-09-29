'use strict';

module.exports = function() {
  var cache = {
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

  this.get = function(key) {
    return cache[key];
  };

  this.set = function(key, value) {
    cache[key] = value;
  };
};