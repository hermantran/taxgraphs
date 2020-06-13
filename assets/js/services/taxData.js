import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';

/* eslint-disable no-use-before-define, no-param-reassign */
/* @ngInject */
function taxData($http, $q, $filter, TAX_API, TAX_YEAR, taxService) {
  const service = {};

  const splitCamelCase = $filter('splitCamelCase');
  const FEDERAL_INCOME_TAX = {
    ORDINARY: 'ordinaryIncome',
    AMT: 'amt',
  };
  const TAX_NAME_MAP = {
    [FEDERAL_INCOME_TAX.ORDINARY]: 'Federal Income',
    [FEDERAL_INCOME_TAX.AMT]: 'AMT',
  };
  const {
    taxBracketEnum,
    calcIsosForAmtIncome,
    calcAmtIncome,
    calcAmtTax,
    calcEffectiveTaxRate,
    calcMarginalTaxRate,
    precalcBracketTaxes,
  } = taxService;
  const { MIN, RATE } = taxBracketEnum;

  service.states = [];
  service.filingStatuses = [];
  service.deductions = [];
  service.credits = [];
  service.years = [];
  service.year = TAX_YEAR;
  service.get = get;
  service.fetch = fetch;
  service.fillMetadata = fillMetadata;
  service.getFederalTaxes = getFederalTaxes;
  service.getStateTaxes = getStateTaxes;
  service.getAllTaxes = getAllTaxes;
  service.getAllRates = getAllRates;
  service.getFederalOrdinaryIncomeTax = getFederalOrdinaryIncomeTax;
  service.getFederalAmt = getFederalAmt;
  service.getAppliedCredits = getAppliedCredits;
  service.getModifiedTaxBracket = getModifiedTaxBracket;
  service.createFlatTaxData = createFlatTaxData;
  service.createMarginalTaxData = createMarginalTaxData;
  service.createEffectiveTaxData = createEffectiveTaxData;
  service.createTotalMarginalTaxData = createTotalMarginalTaxData;
  service.createTotalEffectiveTaxData = createTotalEffectiveTaxData;
  service.createTakeHomePayData = createTakeHomePayData;
  service.createStockOptionAmtData = createStockOptionAmtData;

  service.stateNames = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DC: 'Washington, D.C.',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
  };

  function get() {
    const deferred = $q.defer();

    if (!service.data) {
      service.fetch(TAX_API, deferred);
    } else {
      deferred.resolve(service.data[service.year]);
    }

    return deferred.promise;
  }

  function fetch(url, deferred) {
    $http.get(url).then(({ data }) => {
      service.data = data;
      service.fillMetadata(service.data);
      deferred.resolve(service.data[service.year]);
    });
  }

  function fillMetadata(data) {
    const yearData = data[service.year];
    const { rate, deductions, credits } = yearData.federal.taxes.ordinaryIncome;

    service.years.push(...Object.keys(data));
    service.states.push(...Object.keys(yearData.state));
    service.filingStatuses.push(...Object.keys(rate));
    service.deductions.push(...Object.keys(deductions));
    service.credits.push(...Object.keys(credits));
  }

  function getFederalTaxes(year) {
    let tax;

    year = year || service.year;
    const { taxes } = service.data[year].federal;

    Object.keys(taxes).forEach((taxName) => {
      tax = taxes[taxName];
      tax.name = TAX_NAME_MAP[taxName] || splitCamelCase(taxName);
    });

    return taxes;
  }

  function getStateTaxes(state, year) {
    let tax;

    year = year || service.year;
    const { taxes } = service.data[year].state[state];

    Object.keys(taxes).forEach((taxName) => {
      tax = taxes[taxName];
      tax.name = `${state} ${splitCamelCase(taxName)}`;
    });

    return taxes;
  }

  function getAllTaxes(state, year, status, deductionSettings, creditSettings, useAmt) {
    const taxes = [];
    let tax;
    let deductionValues;
    let creditValues;

    const federalTaxes = getFederalTaxes(year);
    Object.keys(federalTaxes)
      .filter(
        (taxName) => taxName !== (useAmt ? FEDERAL_INCOME_TAX.ORDINARY : FEDERAL_INCOME_TAX.AMT),
      )
      .forEach((taxName) => {
        tax = federalTaxes[taxName];
        deductionValues = deductionSettings.federal[taxName];
        creditValues = creditSettings.federal[taxName];
        taxes.push({
          name: tax.name,
          rate: getModifiedTaxBracket(tax, year, status, deductionValues, creditValues),
          credits: getAppliedCredits(tax.credits, creditValues, status),
        });
      });

    const stateTaxes = getStateTaxes(state, year);
    Object.keys(stateTaxes).forEach((taxName) => {
      tax = stateTaxes[taxName];
      deductionValues = deductionSettings.state[taxName];
      creditValues = creditSettings.state[taxName];
      taxes.push({
        name: tax.name,
        rate: getModifiedTaxBracket(tax, year, status, deductionValues, creditValues),
        credits: getAppliedCredits(tax.credits, creditValues, status),
      });
    });

    return taxes;
  }

  function getAllRates(...args) {
    return getAllTaxes(...args).map(({ rate }) => rate);
  }

  function getFederalOrdinaryIncomeTax(...args) {
    return getAllTaxes(...args).find((tax) => (
      tax.name === TAX_NAME_MAP[FEDERAL_INCOME_TAX.ORDINARY]
    ));
  }

  function getFederalAmt(...args) {
    const useAmt = true;
    return getAllTaxes(...args, useAmt).find((tax) => (
      tax.name === TAX_NAME_MAP[FEDERAL_INCOME_TAX.AMT]
    ));
  }

  function getAppliedDeductions(deductions, deductionValues, status) {
    const deductionsUsed = [];

    Object.keys(deductions).forEach((deductionName) => {
      if (deductionValues[deductionName]) {
        let deduction = deductions[deductionName];

        if (deductionName === 'dependents') {
          deduction = taxService.modifyDependentsDeduction(
            deduction,
            status,
            deductionValues.numDependents,
          );
        }
        deductionsUsed.push(deduction);
      }
    });

    return deductionsUsed;
  }

  function getAppliedCredits(credits, creditValues, status) {
    const creditsUsed = [];

    if (!credits) {
      return null;
    }

    Object.keys(credits).forEach((creditName) => {
      if (creditValues[creditName]) {
        let credit = credits[creditName];

        if (creditName === 'retirementSavers') {
          credit = taxService.modifyRetirementSaversCredit(
            credit,
            status,
            creditValues.retirementContribution,
          );
          creditsUsed.push(credit);
        }
      }
    });

    return creditsUsed;
  }

  function getModifiedTaxBracket(tax, year, status, deductionValues, creditValues) {
    let { deductions } = tax;
    const { credits } = tax;
    const deductionsUsed = [];
    const creditsUsed = [];

    if (!deductions && !tax.useFederalTaxableIncome) {
      return tax.rate;
    }

    deductionsUsed.push(...getAppliedDeductions(deductions, deductionValues, status));

    const {
      standardDeduction,
      itemizedDeduction,
      hasTradRetirement,
      tradRetirementContribution,
    } = deductionValues;

    if (!standardDeduction && itemizedDeduction > 0) {
      deductionsUsed.push({ amount: itemizedDeduction });
    }

    if (hasTradRetirement && tradRetirementContribution > 0) {
      deductionsUsed.push({ amount: tradRetirementContribution });
    }

    if (tax.useFederalTaxableIncome) {
      deductions = getFederalTaxes(year).ordinaryIncome.deductions;
      deductionsUsed.push(...getAppliedDeductions(deductions, deductionValues, status));
    }

    if (credits) {
      creditsUsed.push(...getAppliedCredits(credits, creditValues, status));
    }

    return taxService.modifyTaxBracket(tax.rate, status, deductionsUsed, creditsUsed);
  }

  function createMarginalTaxData(tax, max, filingStatus, credits) {
    max = max || 100000;

    if (isNumber(tax)) {
      return createFlatTaxData(tax, max);
    }
    if (isArray(tax)) {
      return createMarginalBracketTaxData(tax, max, filingStatus, credits);
    }
    if (isPlainObject(tax)) {
      return createMarginalBracketTaxData(tax[filingStatus], max, filingStatus, credits);
    }

    throw new Error('Cannot create marginal tax data');
  }

  function createFlatTaxData(tax, max) {
    const data = [
      {
        x: 0,
        y: tax,
      },
      {
        x: max,
        y: tax,
      },
    ];

    return data;
  }

  function createMarginalBracketTaxData(tax, max, filingStatus, credits) {
    const data = [];
    let bracketMin;

    data.push({
      x: tax[0][MIN],
      y: calcMarginalTaxRate(tax, tax[0][MIN] + 1, filingStatus, credits),
    });

    for (let i = 1, len = tax.length; i < len; i += 1) {
      bracketMin = tax[i][MIN];

      if (max < bracketMin) {
        data.push({
          x: max,
          y: calcMarginalTaxRate(tax, max, filingStatus, credits),
        });

        return data;
      }

      data.push(
        {
          x: bracketMin - 1,
          y: calcMarginalTaxRate(tax, bracketMin - 1, filingStatus, credits),
        },
        {
          x: bracketMin,
          y: calcMarginalTaxRate(tax, bracketMin, filingStatus, credits),
        },
      );
    }

    data.push({
      x: max,
      y: calcMarginalTaxRate(tax, max, filingStatus, credits),
    });

    return data;
  }

  function createEffectiveTaxData(tax, max, filingStatus, credits) {
    max = max || 100000;

    if (isNumber(tax)) {
      return createFlatTaxData(tax, max);
    }
    if (isArray(tax)) {
      return createEffectiveBracketTaxData(tax, max, filingStatus, credits);
    }
    if (isPlainObject(tax)) {
      return createEffectiveBracketTaxData(tax[filingStatus], max, filingStatus, credits);
    }

    throw new Error('Cannot create effective tax data');
  }

  function createTotalMarginalTaxData(taxes, totalBracket, max, filingStatus) {
    const data = taxes.map((tax) => {
      let rate = totalBracket.map((bracket) => [
        bracket[MIN],
        calcMarginalTaxRate(tax.rate, bracket[MIN], filingStatus),
      ]);
      rate = precalcBracketTaxes(rate);
      return createMarginalTaxData(rate, max, filingStatus, tax.credits);
    });

    const brackets = data[0].map(({ x }, i) => {
      const y = data.reduce((total, point) => total + point[i].y, 0);

      return { x, y };
    });

    return brackets;
  }

  function createTotalEffectiveTaxData(taxes, totalBracket, max, filingStatus) {
    const data = taxes.map((tax) => {
      let rate = totalBracket.map((bracket) => [
        bracket[MIN],
        calcMarginalTaxRate(tax.rate, bracket[MIN], filingStatus),
      ]);
      rate = precalcBracketTaxes(rate);
      return createEffectiveTaxData(rate, max, filingStatus, tax.credits);
    });

    const brackets = data[0].map(({ x }, i) => {
      const y = data.reduce((total, point) => total + point[i].y, 0);

      return { x, y };
    });

    return brackets;
  }

  function createEffectiveBracketTaxData(tax, max, filingStatus, credits) {
    const data = [];
    const len = tax.length;
    let bracketMin;
    let prevBracketMin;
    let thirdPoint;
    let twoThirdPoint;
    let i;

    data.push({
      x: tax[0][MIN],
      y: credits ? calcEffectiveTaxRate(tax, tax[0][MIN] + 1, filingStatus, credits) : tax[0][RATE],
    });

    for (i = 1; i < len; i += 1) {
      bracketMin = tax[i][MIN];
      prevBracketMin = tax[i - 1][MIN];
      thirdPoint = prevBracketMin + (bracketMin - prevBracketMin) / 3;
      twoThirdPoint = prevBracketMin + ((bracketMin - prevBracketMin) * 2) / 3;

      if (max < bracketMin) {
        break;
      }

      const dataPoints = [
        thirdPoint,
        twoThirdPoint,
        bracketMin - 10,
        bracketMin - 1,
        bracketMin,
        bracketMin + 10,
      ].map((income) => ({
        x: income,
        y: calcEffectiveTaxRate(tax, income, filingStatus, credits),
      }));

      data.push(...dataPoints);
    }

    prevBracketMin = tax[i - 1][MIN];
    thirdPoint = prevBracketMin + (max - prevBracketMin) / 3;
    twoThirdPoint = prevBracketMin + ((max - prevBracketMin) * 2) / 3;
    const dataPoints = [thirdPoint, twoThirdPoint, max].map((income) => ({
      x: income,
      y: calcEffectiveTaxRate(tax, income, filingStatus, credits),
    }));

    data.push(...dataPoints);

    return data;
  }

  function createTakeHomePayData(taxes, totalBracket, max, filingStatus) {
    const data = createTotalEffectiveTaxData(taxes, totalBracket, max, filingStatus);

    data.forEach((point) => {
      point.y = 1 - point.y;
    });

    return data;
  }

  function createStockOptionAmtData(tax, income, filingStatus, strikePrice, optionValue, isoMax) {
    const data = [];
    const len = tax.length;
    const amtIncomeMax = calcAmtIncome(income, strikePrice, optionValue, isoMax);

    data.push(0);

    for (let i = 1; i < len; i += 1) {
      const bracketMin = tax[i][MIN];

      if (amtIncomeMax < bracketMin) {
        break;
      }

      if (income < bracketMin) {
        const prevBracketMin = tax[i - 1][MIN];
        const thirdPoint = prevBracketMin + (bracketMin - prevBracketMin) / 3;
        const twoThirdPoint = prevBracketMin + ((bracketMin - prevBracketMin) * 2) / 3;

        data.push(...[
          thirdPoint,
          twoThirdPoint,
          bracketMin - 10,
          bracketMin - 1,
          bracketMin,
          bracketMin + 10,
        ].map((amtIncome) => (
          calcIsosForAmtIncome(amtIncome, income, strikePrice, optionValue)
        )));
      }
    }

    data.push(isoMax);

    return data.map((isos) => ({
      x: isos,
      y: calcAmtTax(tax, income, filingStatus, strikePrice, optionValue, isos),
    }));
  }

  return service;
}

export default taxData;
