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
  service.calcTaxCredit = calcTaxCredit;
  service.calcTaxCredits = calcTaxCredits;
  service.calcTax = calcTax;
  service.calcTotalMarginalTaxBrackets = calcTotalMarginalTaxBrackets;
  service.calcMarginalTaxRate = calcMarginalTaxRate;
  service.calcEffectiveTaxRate = calcEffectiveTaxRate;
  service.calcTotalMarginalTaxRate = calcTotalMarginalTaxRate;
  service.calcTotalEffectiveTaxRate = calcTotalEffectiveTaxRate;
  service.createMarginalTaxData = createMarginalTaxData;
  service.createEffectiveTaxData = createEffectiveTaxData;
  service.createTotalMarginalTaxData = createTotalMarginalTaxData;
  service.createTotalEffectiveTaxData = createTotalEffectiveTaxData;
  service.createTakeHomePayData = createTakeHomePayData;
  service.createDeductionsData = createDeductionsData;
  service.createDeductionBracketData = createDeductionBracketData;
  service.applyCreditsToTaxBracket = applyCreditsToTaxBracket;
  service.applyDeductionsToTaxBracket = applyDeductionsToTaxBracket;
  service.modifyDependentsDeduction = modifyDependentsDeduction;
  service.modifyRetirementSaversCredit = modifyRetirementSaversCredit;
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
      tax[i][MAX_TAX] = Math.round(max);
    }
  }

  function calcTaxCredit(credit, income) {
    var refund = 0;

    if (_.isArray(credit.amount)) {
      _(credit.amount).some(function(bracket) {
        if (bracket[0] > income) {   
          return true;
        }

        refund = bracket[1];
      });
    }

    return refund;
  }

  function calcTaxCredits(credits, income, filingStatus,
   taxAmount, withoutTaxCap) {
    var total = 0;

    _(credits).sort(function(credit) {
      return credit.isRefundable ? 1 : -1;
    }).forEach(function(credit) {
      if (_.isPlainObject(credit.amount)) {
        credit.amount = credit.amount[filingStatus];
      }

      var addedAmount = calcTaxCredit(credit, income);

      if (credit.isRefundable || withoutTaxCap) {
        total += addedAmount;
      } else {
        total = Math.min(taxAmount, addedAmount + total);
      }
    });

    return total;
  }

  function calcTax(tax, income, filingStatus, credits) {
    var total;

    if (_.isNumber(tax)) {
      total = tax * income;
    }
    else if (_.isArray(tax)) {
      total = calcEffectiveTax(tax, income, 0, 0);
    }
    else if (_.isPlainObject(tax)) {
      total = calcEffectiveTax(tax[filingStatus], income, 0, 0);
    }

    if (credits) {
      total -= calcTaxCredits(credits, income, filingStatus, total);
    }

    return total;
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

  function createMarginalTaxData(tax, max, filingStatus, credits) {
    max = max || 100000;

    if (_.isNumber(tax)) {
      return createFlatTaxData(tax, max);
    }
    else if (_.isArray(tax)) {
      return createMarginalBracketTaxData(tax, max, filingStatus, credits);
    }
    else if (_.isPlainObject(tax)) {
      return createMarginalBracketTaxData(
        tax[filingStatus], max, filingStatus, credits
      );
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

  function createMarginalBracketTaxData(tax, max, filingStatus, credits) {
    var data = [],
        bracketMin;

    data.push({
      x: tax[0][MIN],
      y: calcMarginalTaxRate(tax, tax[0][MIN] + 1, filingStatus, credits)
    });

    for (var i = 1, len = tax.length; i < len; i++) {
      bracketMin = tax[i][MIN];

      if (max < bracketMin) {
        data.push({
          x: max,
          y: calcMarginalTaxRate(tax, max, filingStatus, credits)
        });

        return data;
      }

      data.push({
        x: bracketMin - 1,
        y: calcMarginalTaxRate(tax, bracketMin - 1, filingStatus, credits)
      }, {
        x: bracketMin,
        y: calcMarginalTaxRate(tax, bracketMin, filingStatus, credits)
      });
    }

    data.push({
      x: max,
      y: calcMarginalTaxRate(tax, max, filingStatus, credits)
    });

    return data;
  }

  function createEffectiveTaxData(tax, max, filingStatus, credits) {
    max = max || 100000;

    if (_.isNumber(tax)) {
      return createFlatTaxData(tax, max);
    }
    else if (_.isArray(tax)) {
      return createEffectiveBracketTaxData(tax, max, filingStatus, credits);
    }
    else if (_.isPlainObject(tax)) {
      return createEffectiveBracketTaxData(
        tax[filingStatus], max, filingStatus, credits
      );
    }
  }

  function createTotalMarginalTaxData(taxes, totalBracket, max, filingStatus) {
    var data = taxes.map(function(tax) {
      var rate = totalBracket.map(function(bracket) {
        return [bracket[MIN], calcMarginalTaxRate(
          tax.rate, bracket[MIN], filingStatus
        )];
      });
      precalcBracketTaxes(rate);
      return createMarginalTaxData(rate, max, filingStatus, tax.credits);
    });

    var brackets = data[0].map(function(bracket, i) {
      var y = data.reduce(function(total, point) {
        return total + point[i].y;
      }, 0);

      return { x: bracket.x, y: y };
    });

    return brackets;
  }

  function createTotalEffectiveTaxData(taxes, totalBracket, max, filingStatus) {
    var data = taxes.map(function(tax) {
      var rate = totalBracket.map(function(bracket) {
        return [bracket[MIN], calcMarginalTaxRate(
          tax.rate, bracket[MIN], filingStatus
        )];
      });
      precalcBracketTaxes(rate);
      return createEffectiveTaxData(rate, max, filingStatus, tax.credits);
    });

    var brackets = data[0].map(function(bracket, i) {
      var y = data.reduce(function(total, point) {
        return total + point[i].y;
      }, 0);

      return { x: bracket.x, y: y };
    });

    return brackets;
  }

  function createEffectiveBracketTaxData(tax, max, filingStatus, credits) {
    var data = [],
        bracketMin,
        prevBracketMin,
        thirdPoint,
        twoThirdPoint;

    max = parseInt(max, 10);

    var lastPoint = {
      x: max,
      y: calcEffectiveTaxRate(tax, max, filingStatus, credits)
    };

    data.push({
      x: tax[0][MIN],
      y: credits ? 
        calcEffectiveTaxRate(tax, tax[0][MIN] + 1, filingStatus, credits) :
        tax[0][RATE]
    });

    for (var i = 1, len = tax.length; i < len; i++) {
      bracketMin = tax[i][MIN];
      prevBracketMin = tax[i - 1][MIN];
      thirdPoint = prevBracketMin + ((bracketMin - prevBracketMin) / 3);
      twoThirdPoint = prevBracketMin + ((bracketMin - prevBracketMin) * 2 / 3);

      if (max < bracketMin) {
        break;
      }

      data.push({
        x: thirdPoint,
        y: calcEffectiveTaxRate(tax, thirdPoint, filingStatus, credits)
      }, {
        x: twoThirdPoint,
        y: calcEffectiveTaxRate(tax, twoThirdPoint, filingStatus, credits)
      }, {
        x: bracketMin - 10,
        y: calcEffectiveTaxRate(tax, bracketMin - 10, filingStatus, credits)
      }, {
        x: bracketMin - 1,
        y: calcEffectiveTaxRate(tax, bracketMin - 1, filingStatus, credits)
      }, {
        x: bracketMin,
        y: calcEffectiveTaxRate(tax, bracketMin, filingStatus, credits)
      }, {
        x: bracketMin + 10,
        y: calcEffectiveTaxRate(tax, bracketMin + 10, filingStatus, credits)
      });
    }

    prevBracketMin = tax[i - 1][MIN];
    thirdPoint = prevBracketMin + ((max - prevBracketMin) / 3);
    twoThirdPoint = prevBracketMin + ((max - prevBracketMin) * 2 / 3);
    data.push({
      x: thirdPoint,
      y: calcEffectiveTaxRate(tax, thirdPoint, filingStatus, credits)
    }, {
      x: twoThirdPoint,
      y: calcEffectiveTaxRate(tax, twoThirdPoint, filingStatus, credits)
    }, lastPoint);

    return data;
  }

  function createTakeHomePayData(taxes, totalBracket, max, filingStatus) {
    var data = createTotalEffectiveTaxData(
      taxes, totalBracket, max, filingStatus
    );

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

  function calcMarginalTaxRate(tax, income, filingStatus, credits) {
    if (!_(credits).isEmpty() &&
      calcEffectiveTaxRate(tax, income, filingStatus, credits) <= 0
    ) {
      return 0;
    }

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

  function calcEffectiveTaxRate(tax, income, filingStatus, credits) {
    if (income < 1) {
      return 0;
    }
    var rate = calcTax(tax, income, filingStatus, credits) / income;
    return Math.max(rate, 0);
  }

  function calcTotalMarginalTaxRate(taxes, income, filingStatus) {
    var rate = _(taxes).reduce(function(total, tax) {
      var added = calcMarginalTaxRate(
        tax.rate, income, filingStatus, tax.credits
      );
      return total + added;
    }, 0);

    return Math.max(rate, 0);
  }

  function calcTotalEffectiveTaxRate(taxes, income, filingStatus) {
    var rate = _(taxes).reduce(function(total, tax) {
      var added = calcEffectiveTaxRate(
        tax.rate, income, filingStatus, tax.credits
      );
      return total + added;
    }, 0);

    return Math.max(rate, 0);
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

  function modifyRetirementSaversCredit(credit, filingStatus, contribution) {
    var copy = _.cloneDeep(credit),
        rate = credit.rate;

    contribution = isNaN(contribution) ? 0 : contribution;

    if (_.isPlainObject(rate)) {
      rate = rate[filingStatus];
    }

    copy.amount = rate.map(function(bracket) {
      return [
        bracket[0],
        Math.min(credit.maximum, contribution * bracket[1])
      ];
    });

    return copy;
  }

  function applyDeductionsToTaxBracket(tax, filingStatus, deductions) {
    var deductionsData = createDeductionsData(deductions, filingStatus)
          .reverse(),
        copy,
        currentDeductionBracket;

    if (!deductionsData.length) {
      copy = _.cloneDeep(tax);
    } else {
      copy = [ [0, 0, 0] ];

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
    }

    return copy;
  }

  function applyCreditsToTaxBracket(tax, filingStatus, credits) {
    if (_.isPlainObject(tax)) {
      tax = tax[filingStatus];
    }

    var copy = _.cloneDeep(tax);

    if (!credits.length) {
      return copy;
    }

    _(credits).forEach(function(credit) {
      var amount = credit.amount;
      if (_.isPlainObject(amount)) {
        amount = amount[filingStatus];
      }

      _(amount).forEach(function(creditBracket) {
        var isAdded = _(copy).some(function(taxBracket, i) {
          if (taxBracket[MIN] === creditBracket[MIN]) {
            return true;
          }

          if (taxBracket[MIN] > creditBracket[MIN]) {
            copy.push([creditBracket[MIN], copy[i-1][RATE]]);
            return true;
          }
        });

        if (!isAdded) {
          copy.push([creditBracket[MIN], copy[tax.length - 1][RATE]]);
        }
      });

      copy.sort(function(a, b) {
        return a[MIN] - b[MIN];
      });
    });
    
    precalcBracketTaxes(copy);

    var final = [];

    _(copy).some(function(bracket, i) {
      final.push(_.cloneDeep(bracket));
      if (i === copy.length - 1) {
        return true;
      }

      var maxTax = bracket[MAX_TAX],
          creditAtMax = calcTaxCredits(
            credits, copy[i+1][MIN] - 1, filingStatus, maxTax, true
          ),
          minTax = i === 0 ? 0 : copy[i-1][MAX_TAX],
          creditAtMin = calcTaxCredits(
            credits, copy[i][MIN], filingStatus, minTax, true
          ),
          coversMax = creditAtMax - maxTax > 0,
          coversMin = creditAtMin - minTax > 0,
          incomeStep;

      if (coversMax !== coversMin) {
        incomeStep = Math.round((creditAtMin - minTax) / bracket[RATE]);
        final.push([bracket[MIN] + incomeStep + 1, bracket[RATE]]);
      }
    });

    final.sort(function(a, b) {
      return a[MIN] - b[MIN];
    });
    
    precalcBracketTaxes(final);
    return final;
  }

  function modifyTaxBracket(tax, filingStatus, deductions, credits) {
    var finalTax = applyDeductionsToTaxBracket(tax, filingStatus, deductions);
    finalTax = applyCreditsToTaxBracket(finalTax, filingStatus, credits);

    return finalTax;
  }

  return service;
}

module.exports = taxService;