'use strict';

require('../lib/Math.round10');

/* @ngInject */
function taxService(_) {
  var service = {};

  // enum to represent tax bracket indices
  var MIN = 0,
      RATE = 1,
      MAX_TAX = 2;

  service.preprocessTaxes = preprocessTaxes;
  service.calcTax = calcTax;
  service.calcMarginalTax = calcMarginalTax;
  service.calcTotalMarginalTaxBrackets = calcTotalMarginalTaxBrackets;
  service.calcMarginalTaxRate = calcMarginalTaxRate;
  service.calcEffectiveTaxRate = calcEffectiveTaxRate;
  service.calcDeduction = calcDeduction;
  service.calcTotalDeduction = calcTotalDeduction;
  service.createDeductionsData = createDeductionsData;
  service.createDeductionBracketData = createDeductionBracketData;
  service.createMarginalTaxData = createMarginalTaxData;
  service.createEffectiveTaxData = createEffectiveTaxData;
  service.createTakeHomePayData = createTakeHomePayData;
  service.modifyDependentsDeduction = modifyDependentsDeduction;
  service.modifyTaxBracket = modifyTaxBracket;

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

    return taxes;
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
    for (var i = 0, len = tax.length, max = 0; i < len - 1; i++) {
      max += (tax[i + 1][MIN] - tax[i][MIN]) * tax[i][RATE];
      tax[i][MAX_TAX] = Math.round10(max, -2);
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

  function calcMarginalTax(tax, income, filingStatus) {
    if (_.isNumber(tax)) {
      return tax * income;
    }
    else if (_.isArray(tax)) {
      return calcMarginalTaxRate(tax, income, filingStatus) * income;
    }
    else if (_.isPlainObject(tax)) {
      return calcMarginalTaxRate(tax, income, filingStatus) * income;
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
        prevBracketMin,
        thirdPoint,
        twoThirdPoint,
        effectiveTaxRate;

    max = parseInt(max, 10);

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
      prevBracketMin = tax[i - 1][MIN];
      thirdPoint = prevBracketMin + ((bracketMin - prevBracketMin) / 3);
      twoThirdPoint = prevBracketMin + ((bracketMin - prevBracketMin) * 2 / 3);

      if (max < bracketMin) {
        break;
      }

      effectiveTaxRate = Math.round10(tax[i - 1][MAX_TAX] / bracketMin, -4);

      data.push({
        x: thirdPoint,
        y: calcEffectiveTaxRate(tax, thirdPoint, filingStatus)
      }, {
        x: twoThirdPoint,
        y: calcEffectiveTaxRate(tax, twoThirdPoint, filingStatus)
      }, {
        x: bracketMin - 1,
        y: effectiveTaxRate
      }, {
        x: bracketMin,
        y: effectiveTaxRate
      });
    }

    prevBracketMin = tax[i - 1][MIN];
    thirdPoint = prevBracketMin + ((max - prevBracketMin) / 3);
    twoThirdPoint = prevBracketMin + ((max - prevBracketMin) * 2 / 3);
    data.push({
      x: thirdPoint,
      y: calcEffectiveTaxRate(tax, thirdPoint, filingStatus)
    }, {
      x: twoThirdPoint,
      y: calcEffectiveTaxRate(tax, twoThirdPoint, filingStatus)
    }, lastPoint);

    return data;
  }

  function createTakeHomePayData(tax, max, filingStatus) {
    var data = createEffectiveTaxData(tax, max, filingStatus);

    for (var i = 0, len = data.length; i < len; i++) {
      data[i].y = 1 - data[i].y;
    }

    return data;
  }

  function calcTotalMarginalTaxBrackets(taxes, max, filingStatus) {
    var brackets = [];

    _(taxes).forEach(function(tax) {
      var copy;

      if (_.isArray(tax)) {
        copy = _.cloneDeep(tax);
      }
      else if (_.isPlainObject(tax)) {
        copy = _.cloneDeep(tax[filingStatus]);
      }

      brackets.push.apply(brackets, copy);
    });

    brackets.sort(function(a, b) {
      return a[MIN] - b[MIN];
    });

    brackets = _.uniq(brackets, function(bracket) {
      return bracket[MIN];
    });

    brackets = _.map(brackets, function(bracket) {
      var totalRate = 0;

      for (var i = 0, len = taxes.length; i < len; i++) {
        totalRate += calcMarginalTaxRate(taxes[i], bracket[MIN], filingStatus);
      }

      return [bracket[MIN], totalRate];
    });

    precalcBracketTaxes(brackets);
    return brackets;
  }

  function calcMarginalTaxRate(tax, income, filingStatus) {
    if (_.isNumber(tax)) {
      return tax;
    }
    else if (_.isPlainObject(tax)) {
      tax = tax[filingStatus];
    }

    for (var i = 0, len = tax.length; i < len - 1; i++) {
      if (income >= tax[i][MIN] && income < tax[i + 1][MIN]) {
        return tax[i][RATE];
      }  
    }

    return tax[len - 1][RATE];
  }

  function calcEffectiveTaxRate(tax, income, filingStatus) {
    return calcTax(tax, income, filingStatus) / income;
  }

  function calcDeduction(deduction, filingStatus) {
    if (_.isNumber(deduction)) {
      return deduction;
    }
    else if (_.isPlainObject(deduction)) {
      return calcDeduction(deduction[filingStatus], filingStatus);
    }
    // TODO: apply deduction phase-outs
    else if (_.isArray(deduction)) {
      return deduction[0][1];
    }
  }

  function calcTotalDeduction(deductions, filingStatus) {
    var total = 0;

    _(deductions).forEach(function(deduction) {
      total += calcDeduction(deduction, filingStatus);
    });

    return total;
  }

  function createDeductionBracketData(deduction, filingStatus) {
    var amount = deduction.amount,
        phaseout = deduction.phaseout,
        brackets = [],
        steps,
        i;

    if (_.isPlainObject(amount)) {
      amount = amount[filingStatus];
    }

    if (_.isPlainObject(phaseout)) {
      phaseout = phaseout[filingStatus] || phaseout;
      steps = Math.ceil(amount - phaseout.minimum) / phaseout.reduction;
      brackets.push([0, amount]);
      for (i = 1; i <= steps; i++) {
        brackets.push([
          phaseout.start + (phaseout.step * i),
          amount - (phaseout.reduction * i)
        ]);
      }
    }
    else if (_.isNumber(amount)) {
      brackets.push([0, amount]);
    }
    else if (_.isArray(amount)) {
      brackets.push.apply(brackets, amount);
    }

    return brackets;
  }

  function createDeductionsData(deductions, filingStatus) {
    if (!deductions.length) {
      return [];
    }

    var allBrackets = deductions.map(function(deduction) {
      return createDeductionBracketData(deduction, filingStatus);
    });

    var deductionMap = {},
        incomeSteps = [],
        currentStep;

    if (allBrackets.length <= 1) {
      return allBrackets[0];
    }

    _(allBrackets).forEach(function(brackets) {
      _(brackets).forEach(function(bracket) {
        currentStep = bracket[0];
        deductionMap[currentStep] = 0;
        incomeSteps.push(currentStep);
      });
    });

    incomeSteps = _.uniq(incomeSteps.sort(function(a, b) {
      return a - b;
    }), true);

    _(allBrackets).forEach(function(brackets) {
      var bracketLen = brackets.length;
      _(brackets).forEach(function(bracket, i) {
        currentStep = bracket[0];
        incomeSteps.forEach(function(step) {
          if (currentStep <= step &&
            (i >= bracketLen - 1 || brackets[i + 1][0] > step)
          ) {
            deductionMap[step] += bracket[1];
          }
        });
      });
    });

    return Object.keys(deductionMap).map(function(step) {
      return [parseInt(step, 10), deductionMap[step]];
    }).sort(function(a, b) {
      return a[0] - b[0];
    });
  }

  function modifyDependentsDeduction(deduction, filingStatus, numDependents) {
    var copy = _.cloneDeep(deduction),
        amount = deduction.amount;

    if (_.isPlainObject(amount)) {
      amount = amount[filingStatus];
    }

    if (_.isNumber(amount)) {
      copy.amount = amount * numDependents;
    }
    else if (_.isArray(amount)) {
      copy.amount = amount.map(function(bracket) {
        return [bracket[0], bracket[1] * numDependents];
      });
    }

    return copy;
  }

  function modifyTaxBracket(tax, filingStatus, deductions) {
    var deductionsData = createDeductionsData(deductions, filingStatus)
          .reverse(),
        copy = [ [0, 0, 0] ],
        currentDeductionBracket;

    if (!deductionsData.length) {
      return tax;
    }

    if (_.isNumber(tax)) {
      copy.push([0, tax]);
    }
    if (_.isArray(tax)) {
      copy.push.apply(copy, _.cloneDeep(tax));
    }
    else if (_.isPlainObject(tax)) {
      copy.push.apply(copy, _.cloneDeep(tax[filingStatus]));
    }

    _(copy).forEach(function(taxBracket, i) {
      if (i === 0) {
        return;
      }

      _(deductionsData).some(function(bracket) {
        currentDeductionBracket = bracket;
        return bracket[0] <= taxBracket[MIN];
      });
      taxBracket[MIN] += currentDeductionBracket[1];
    });

    precalcBracketTaxes(copy);
    return copy;
  }

  return service;
}

module.exports = taxService;