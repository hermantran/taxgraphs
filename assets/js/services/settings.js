/* eslint-disable no-use-before-define */
/* @ngInject */
function settings(APP_NAME, APP_VERSION, TAX_YEAR, localStorageService, _) {
  const service = {};

  service.key = `${APP_NAME}Settings${APP_VERSION}`;
  service.get = get;
  service.set = set;

  service.animationTimes = [0, 1000, 2000, 3000];
  service.xAxisScales = {
    linear: 'Linear',
    log: 'Logarithmic',
  };

  service.deductionDefaults = {
    itemized: 0,
    standardDeduction: true,
    personalExemption: true,
    dependents: false,
    numDependents: 0,
  };

  service.creditDefaults = {
    retirementSavers: false,
    retirementContribution: 0,
  };

  service.graphDefaults = {
    xAxisScale: service.xAxisScales.linear,
    xMin: 0,
    xMax: 300000,
    yMin: 0,
    yMax: 60,
    animationTime: 2000,
  };

  const defaults = {
    stateBreakdownData: {
      state: 'CA',
      year: TAX_YEAR,
      status: 'single',
      deductions: createDeductionSettings(),
      credits: createCreditSettings(),
      graphLines: {
        effective: true,
        marginal: false,
        totalEffective: true,
        totalMarginal: true,
      },
      graph: createGraphSettings(),
    },
    stateComparisonData: {
      states: {
        CA: true,
        IL: true,
        PA: true,
        NY: true,
        TX: true,
      },
      year: TAX_YEAR,
      status: 'single',
      deductions: createDeductionSettings(),
      credits: createCreditSettings(),
      graphLines: {
        effective: true,
        marginal: false,
      },
      graph: createGraphSettings(),
    },
    takeHomePayData: {
      state: 'CA',
      year: TAX_YEAR,
      deductions: createDeductionSettings(),
      credits: createCreditSettings(),
      graphLines: {
        single: true,
        married: true,
      },
      graph: createGraphSettings(),
    },
  };

  const cache = localStorageService.get(service.key) || defaults;

  function get(key) {
    return cache[key];
  }

  function set(key, value) {
    cache[key] = value;
    localStorageService.set(service.key, cache);
  }

  function createGraphSettings() {
    return _.cloneDeep(service.graphDefaults);
  }

  function createDeductionSettings() {
    return {
      federal: {
        federalIncome: _.cloneDeep(service.deductionDefaults),
      },
      state: {
        income: _.cloneDeep(service.deductionDefaults),
      },
    };
  }

  function createCreditSettings() {
    return {
      federal: {
        federalIncome: _.cloneDeep(service.creditDefaults),
      },
      state: {
        income: _.cloneDeep(service.creditDefaults),
      },
    };
  }

  return service;
}

export default settings;
