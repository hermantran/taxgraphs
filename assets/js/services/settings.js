/* eslint-disable no-use-before-define */
/* @ngInject */
function settings(APP_NAME, APP_VERSION, TAX_YEAR, localStorageService, _) {
  const service = {};

  service.key = `${APP_NAME}Settings${APP_VERSION}`;
  service.get = get;
  service.set = set;

  service.xAxisScales = {
    linear: 'Linear',
    log: 'Logarithmic',
  };
  service.axisFormats = {
    dollar: 'dollar',
    number: 'number',
    percent: 'percent',
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
    yMax: 0.6,
    animationTime: 1250,
  };

  const getBaseDefaults = () => ({
    year: TAX_YEAR,
    status: 'single',
    state: 'CA',
    deductions: createDeductionSettings(),
    credits: createCreditSettings(),
    graph: createGraphSettings(),
  });

  const defaults = {
    stateBreakdownData: {
      ...getBaseDefaults(),
      graphLines: {
        effective: true,
        marginal: false,
        totalEffective: true,
        totalMarginal: true,
      },
    },
    stateComparisonData: {
      ...getBaseDefaults(),
      states: {
        CA: true,
        IL: true,
        PA: true,
        NY: true,
        TX: true,
      },
      graphLines: {
        effective: true,
        marginal: false,
      },
    },
    stateHistoryData: {
      ...getBaseDefaults(),
      graphLines: {
        [TAX_YEAR]: true,
        [TAX_YEAR - 1]: true,
        [TAX_YEAR - 2]: true,
        [TAX_YEAR - 3]: true,
        [TAX_YEAR - 4]: true,
      },
    },
    stockOptionAmtData: {
      ...getBaseDefaults(),
      state: 'TX',
      income: 150000,
      strikePrice: 2,
      optionValue: 6.50,
      graph: {
        ...getBaseDefaults().graph,
        xMax: 10000,
      },
    },
    takeHomePayData: {
      ...getBaseDefaults(),
      graphLines: {
        single: true,
        married: true,
      },
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
        ordinaryIncome: _.cloneDeep(service.deductionDefaults),
        amt: {
          amtExemption: true,
        },
      },
      state: {
        income: _.cloneDeep(service.deductionDefaults),
      },
    };
  }

  function createCreditSettings() {
    return {
      federal: {
        ordinaryIncome: _.cloneDeep(service.creditDefaults),
      },
      state: {
        income: _.cloneDeep(service.creditDefaults),
      },
    };
  }

  return service;
}

export default settings;
