'use strict';

require('../lib/Math.round10');

module.exports = function(_) {
  // enum to represent tax bracket indices
  var MIN = 0,
      RATE = 1,
      MAX_TAX = 2;

  function preprocessTaxes(taxes, rateProp) {
    rateProp = rateProp || 'rate';

    for (var prop in taxes) {
      if (taxes.hasOwnProperty(prop)) {
        if (prop === rateProp) {
          preprocessRateProp(taxes[prop]);
        }
        else if (_.isPlainObject(taxes[prop])) {
          preprocessTaxes(taxes[prop]);
        }
      }
    }
  }

  function preprocessRateProp(rate) {
    if (_.isArray(rate)) {
      precalcBracketTaxes(rate);
    }
    else if (_.isPlainObject(rate)) {
      for (var status in rate) {
        if (rate.hasOwnProperty(status)) {
          precalcBracketTaxes(rate[status]);
        }
      }
    }
  }

  function precalcBracketTaxes(tax) {
    for (var i = 0, len = tax.length, max = 0; i < len; i++) {
      if (len > i + 1) {
        max += (tax[i + 1][MIN] - tax[i][MIN]) * tax[i][RATE];
        tax[i].push(Math.round10(max, -2));
      }
    }
  }

  function calcTax(tax, income, filingStatus) {
    if (_.isNumber(tax)) {
      return tax * income;
    }
    else if (_.isArray(tax)) {
      return calcEffectiveTax(tax, income, 0, 0);
    }
    else if (_.isPlainObject(tax)) {
      return calcEffectiveTax(tax[filingStatus], income, 0, 0);
    }
  }

  function calcEffectiveTax(tax, income, bracket, balance) {
    var numBrackets = tax.length,
        bracketMin = tax[bracket][MIN],
        nextBracketMin = -1;

    bracket = bracket || 0;
    balance = balance || 0;

    if (bracketMin > income) {
      return balance;
    }

    if (numBrackets > bracket + 1) {
      nextBracketMin = tax[bracket + 1][MIN];
    }

    if (nextBracketMin > -1 && income > nextBracketMin) {
      balance = tax[bracket][MAX_TAX];
      return calcEffectiveTax(tax, income, ++bracket, balance);
    } else {
      balance += (income - bracketMin) * tax[bracket][RATE];
      return Math.round10(balance, -2);
    }
  }

  function createMarginalTaxData(tax, max, filingStatus) {
    max = max || 100000;

    if (_.isNumber(tax)) {
      return createFlatTaxData(tax, max);
    }
    else if (_.isArray(tax)) {
      return createMarginalBracketTaxData(tax, max);
    }
    else if (_.isPlainObject(tax)) {
      return createMarginalBracketTaxData(tax[filingStatus], max);
    }
  }

  function createFlatTaxData(tax, max) {
    var data = [
      {
        x: 0,
        y: tax
      }, {
        x: max,
        y: tax
      }
    ];

    return data;
  }

  function createMarginalBracketTaxData(tax, max) {
    var data = [],
        bracketMin;

    data.push({
      x: tax[0][MIN],
      y: tax[0][RATE]
    });

    for (var i = 1, len = tax.length; i < len; i++) {
      bracketMin = tax[i][MIN];

      if (max < bracketMin) {
        data.push({
          x: max,
          y: tax[i - 1][RATE]
        });

        return data;
      }

      data.push({
        x: bracketMin - 1,
        y: tax[i - 1][RATE]
      }, {
        x: bracketMin,
        y: tax[i][RATE]
      });
    }

    data.push({
      x: max,
      y: tax[len - 1][RATE]
    });

    return data;
  }

  function createEffectiveTaxData(tax, max, filingStatus) {
    max = max || 100000;

    if (_.isNumber(tax)) {
      return createFlatTaxData(tax, max);
    }
    else if (_.isArray(tax)) {
      return createEffectiveBracketTaxData(tax, max);
    }
    else if (_.isPlainObject(tax)) {
      return createEffectiveBracketTaxData(
        tax[filingStatus], max, filingStatus
      );
    }
  }

  function createEffectiveBracketTaxData(tax, max, filingStatus) {
    var data = [],
        bracketMin,
        effectiveTaxRate;

    var lastPoint = {
      x: max,
      y: calcTax(tax, max, filingStatus) / max
    };

    data.push({
      x: tax[0][MIN],
      y: tax[0][RATE]
    });

    for (var i = 1, len = tax.length; i < len; i++) {
      bracketMin = tax[i][MIN];

      if (max < bracketMin) {
        break;
      }

      effectiveTaxRate = Math.round10(tax[i - 1][MAX_TAX] / bracketMin, -4);

      data.push({
        x: bracketMin - 1,
        y: effectiveTaxRate
      }, {
        x: bracketMin,
        y: effectiveTaxRate
      });
    }

    data.push(lastPoint);

    return data;
  }

  this.preprocessTaxes = preprocessTaxes;
  this.calcTax = calcTax;
  this.createMarginalTaxData = createMarginalTaxData;
  this.createEffectiveTaxData = createEffectiveTaxData;
};