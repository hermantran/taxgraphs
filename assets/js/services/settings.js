/* eslint-disable no-use-before-define */
/* @ngInject */
function settings(APP_NAME, APP_VERSION, TAX_YEAR, localStorageService) {
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
    itemizedDeduction: 0,
    standardDeduction: true,
    personalExemption: true,
    dependents: false,
    numDependents: 0,
    hasTradRetirement: false,
    tradRetirementContribution: 0,
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
    animationTime: 1050,
  };

  const getBaseDefaults = () => ({
    year: TAX_YEAR,
    status: 'single',
    state: 'CA',
    deductions: createDeductionSettings(),
    credits: createCreditSettings(),
    graph: { ...service.graphDefaults },
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
      state: 'CA',
      income: 150000,
      stockOptions: [{
        isoAmount: 7000,
        strikePrice: 6.15,
        optionValue: 10.75,
      }],
      graph: {
        ...getBaseDefaults().graph,
      },
      deductions: createDeductionSettings({
        hasTradRetirement: true,
        tradRetirementContribution: 10000,
      }),
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

  function createDeductionSettings(federalIncomeOverrides) {
    return {
      federal: {
        ordinaryIncome: {
          ...service.deductionDefaults,
          ...(federalIncomeOverrides || {}),
        },
        amt: {
          amtExemption: true,
        },
      },
      state: {
        income: { ...service.deductionDefaults },
        amt: {
          amtExemption: true,
        },
      },
    };
  }

  function createCreditSettings() {
    return {
      federal: {
        ordinaryIncome: { ...service.creditDefaults },
      },
      state: {
        income: { ...service.creditDefaults },
      },
    };
  }

  return service;
}

export default settings;
