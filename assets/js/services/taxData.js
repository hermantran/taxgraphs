'use strict';

/* @ngInject */
function taxData($http, $q, $filter, TAX_API, taxService) {
  var service = {},
      splitCamelCase = $filter('splitCamelCase');

  service.states = [];
  service.filingStatuses = [];
  service.deductions = [];
  service.years = [];
  service.taxTypes = ['effective', 'marginal'];
  service.year = '2015';
  service.get = get;
  service.fetch = fetch;
  service.fillMetadata = fillMetadata;
  service.getFederalTaxes = getFederalTaxes;
  service.getStateTaxes = getStateTaxes;
  service.getAllTaxes = getAllTaxes;
  service.getAllRates = getAllRates;
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
    var deferred = $q.defer();

    if (!service.data) {
      service.fetch(TAX_API, deferred);
    } else {
      deferred.resolve(service.data[service.year]);
    }

    return deferred.promise;
  }

  function fetch(url, deferred) {
    $http.get(url).then(function(resp) {
      service.data = resp.data;
      service.fillMetadata(service.data);
      deferred.resolve(service.data[service.year]);
    });
  }

  function fillMetadata(data) {
    for (var year in data) {
      service.years.push(year);
    }

    data = data[service.year];

    for (var state in data.state) {
      service.states.push(state);
    }

    for (var filingStatus in data.federal.taxes.federalIncome.rate) {
      service.filingStatuses.push(filingStatus);
    }

    for (var deduction in data.federal.taxes.federalIncome.deductions) {
      service.deductions.push(deduction);
    }
  }

  function getFederalTaxes(year) {
    var taxes, tax;

    year = year || service.year;
    taxes = service.data[year].federal.taxes;

    for (var taxName in taxes) {
      tax = taxes[taxName];
      tax.name = splitCamelCase(taxName);
    }

    return taxes;
  }

  function getStateTaxes(state, year) {
    var taxes, tax;

    year = year || service.year;
    taxes = service.data[year].state[state].taxes;

    for (var taxName in taxes) {
      tax = taxes[taxName];
      tax.name = state + ' ' + splitCamelCase(taxName);
    }

    return taxes;
  }

  function getAllTaxes(state, year, status, deductionSettings) {
    var federalTaxes = getFederalTaxes(year),
        stateTaxes = getStateTaxes(state, year),
        taxes = [],
        taxName,
        tax,
        deductionValues;

    for (taxName in federalTaxes) {
      tax = federalTaxes[taxName];
      deductionValues = deductionSettings.federal[taxName];
      taxes.push({
        name: tax.name,
        rate: getModifiedTaxBracket(tax, status, deductionValues),
        source: tax.source
      });
    }

    for (taxName in stateTaxes) {
      tax = stateTaxes[taxName];
      deductionValues = deductionSettings.state[taxName];
      taxes.push({
        name: tax.name,
        rate: getModifiedTaxBracket(tax, status, deductionValues),
        source: tax.source
      });
    }

    return taxes;
  }

  function getAllRates(state, year, status, deductionSettings) {
    var federalTaxes = getFederalTaxes(year),
        stateTaxes = getStateTaxes(state, year),
        taxes = [],
        taxName,
        tax,
        deductionValues;

    for (taxName in federalTaxes) {
      tax = federalTaxes[taxName];
      deductionValues = deductionSettings.federal[taxName];
      taxes.push(getModifiedTaxBracket(tax, status, deductionValues));
    }

    for (taxName in stateTaxes) {
      tax = stateTaxes[taxName];
      deductionValues = deductionSettings.state[taxName];
      taxes.push(getModifiedTaxBracket(tax, status, deductionValues));
    }

    return taxes;
  }

  function getModifiedTaxBracket(tax, status, deductionValues) {
    var deductions = tax.deductions,
        deductionsUsed = [];

    if (!deductions) {
      return tax.rate;
    }

    for (var deduction in deductions) {
      if (deductionValues[deduction]) {
        deductionsUsed.push(deductions[deduction].amount);
      }
    }

    if (deductionValues.itemized > 0) {
      deductionsUsed.push(deductionValues.itemized);
    }

    return taxService.modifyTaxBracket(tax.rate, status, deductionsUsed);
  }

  return service;
}

module.exports = taxData;