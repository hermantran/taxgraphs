/* eslint-disable no-use-before-define, no-param-reassign */
/* @ngInject */
function taxData($http, $q, $filter, TAX_API, TAX_YEAR, taxService) {
  const service = {};
  const splitCamelCase = $filter('splitCamelCase');

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
  service.getAppliedCredits = getAppliedCredits;
  service.getModifiedTaxBracket = getModifiedTaxBracket;

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

    service.years.push(...Object.keys(data));
    service.states.push(...Object.keys(yearData.state));
    service.filingStatuses.push(...Object.keys(yearData.federal.taxes.federalIncome.rate));
    service.deductions.push(...Object.keys(yearData.federal.taxes.federalIncome.deductions));
    service.credits.push(...Object.keys(yearData.federal.taxes.federalIncome.credits));
  }

  function getFederalTaxes(year) {
    let tax;

    year = year || service.year;
    const { taxes } = service.data[year].federal;

    Object.keys(taxes).forEach((taxName) => {
      tax = taxes[taxName];
      tax.name = splitCamelCase(taxName);
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

  function getAllTaxes(state, year, status, deductionSettings, creditSettings) {
    const federalTaxes = getFederalTaxes(year);
    const stateTaxes = getStateTaxes(state, year);
    const taxes = [];
    let tax;
    let deductionValues;
    let creditValues;

    Object.keys(federalTaxes).forEach((taxName) => {
      tax = federalTaxes[taxName];
      deductionValues = deductionSettings.federal[taxName];
      creditValues = creditSettings.federal[taxName];
      taxes.push({
        name: tax.name,
        rate: getModifiedTaxBracket(tax, year, status, deductionValues, creditValues),
        credits: getAppliedCredits(tax.credits, creditValues, status),
      });
    });

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

    if (deductionValues.itemized > 0) {
      deductionsUsed.push({ amount: deductionValues.itemized });
    }

    if (tax.useFederalTaxableIncome) {
      deductions = getFederalTaxes(year).federalIncome.deductions;
      deductionsUsed.push(...getAppliedDeductions(deductions, deductionValues, status));
    }

    if (credits) {
      creditsUsed.push(...getAppliedCredits(credits, creditValues, status));
    }

    return taxService.modifyTaxBracket(tax.rate, status, deductionsUsed, creditsUsed);
  }

  return service;
}

export default taxData;
