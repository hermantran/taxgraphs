'use strict';

/* @ngInject */
function taxData($http, $q, $filter, TAX_API, TAX_YEAR, taxService) {
  var service = {},
      splitCamelCase = $filter('splitCamelCase');

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

    for (var credit in data.federal.taxes.federalIncome.credits) {
      service.credits.push(credit);
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

  function getAllTaxes(state, year, status, deductionSettings, creditSettings) {
    var federalTaxes = getFederalTaxes(year),
        stateTaxes = getStateTaxes(state, year),
        taxes = [],
        taxName,
        tax,
        deductionValues,
        creditValues;

    for (taxName in federalTaxes) {
      tax = federalTaxes[taxName];
      deductionValues = deductionSettings.federal[taxName];
      creditValues = creditSettings.federal[taxName];
      taxes.push({
        name: tax.name,
        rate: getModifiedTaxBracket(
          tax, year, status, deductionValues, creditValues
        ),
        credits: getAppliedCredits(tax.credits, creditValues, status)
      });
    }

    for (taxName in stateTaxes) {
      tax = stateTaxes[taxName];
      deductionValues = deductionSettings.state[taxName];
      creditValues = creditSettings.state[taxName];
      taxes.push({
        name: tax.name,
        rate: getModifiedTaxBracket(
          tax, year, status, deductionValues, creditValues
        ),
        credits: getAppliedCredits(tax.credits, creditValues, status)
      });
    }

    return taxes;
  }

  function getAllRates() {
    return getAllTaxes.apply(service, arguments).map(function(tax) {
      return tax.rate;
    });
  }

  function getAppliedDeductions(deductions, deductionValues, status) {
    var deductionsUsed = [];

    for (var deductionName in deductions) {
      if (deductionValues[deductionName]) {
        var deduction = deductions[deductionName];

        if (deductionName === 'dependents') {
          deduction = taxService.modifyDependentsDeduction(
            deduction, status, deductionValues.numDependents
          );
        }
        deductionsUsed.push(deduction);
      }
    }

    return deductionsUsed;
  }

  function getAppliedCredits(credits, creditValues, status) {
    var creditsUsed = [];

    if (!credits) {
      return null;
    }

    for (var creditName in credits) {
      if (creditValues[creditName]) {
        var credit = credits[creditName];

        if (creditName === 'retirementSavers') {
          credit = taxService.modifyRetirementSaversCredit(
            credit, status, creditValues.retirementContribution
          );
          creditsUsed.push(credit);
        }
      }
    }

    return creditsUsed;
  }

  function getModifiedTaxBracket(tax, year, status, deductionValues,
   creditValues) {
    var deductions = tax.deductions,
        credits = tax.credits,
        deductionsUsed = [],
        creditsUsed = [];

    if (!deductions && !tax.useFederalTaxableIncome) {
      return tax.rate;
    }

    deductionsUsed.push.apply(deductionsUsed, 
      getAppliedDeductions(deductions, deductionValues, status)
    );

    if (deductionValues.itemized > 0) {
      deductionsUsed.push({ amount: deductionValues.itemized });
    }

    if (tax.useFederalTaxableIncome) {
      deductions = getFederalTaxes(year).federalIncome.deductions;
      deductionsUsed.push.apply(deductionsUsed, 
        getAppliedDeductions(deductions, deductionValues, status)
      );
    }

    if (credits) {
      creditsUsed.push.apply(creditsUsed,
        getAppliedCredits(credits, creditValues, status)
      );
    }

    return taxService.modifyTaxBracket(
      tax.rate, status, deductionsUsed, creditsUsed
    );
  }

  return service;
}

module.exports = taxData;