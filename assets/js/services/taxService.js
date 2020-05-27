Number.isNaN = require('is-nan');
require('../lib/Math.round10');

/* eslint-disable no-use-before-define, no-param-reassign, prefer-destructuring */
/* @ngInject */
function taxService(_) {
  const service = {};

  // enum to represent tax bracket indices
  const MIN = 0;
  const RATE = 1;
  const MAX_TAX = 2;

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

    Object.keys(taxes).forEach((prop) => {
      if (prop === rateProp) {
        preprocessRateProp(taxes[prop]);
      } else if (_.isPlainObject(taxes[prop])) {
        preprocessTaxes(taxes[prop]);
      }
    });

    return taxes;
  }

  function preprocessRateProp(rate) {
    if (_.isArray(rate)) {
      precalcBracketTaxes(rate);
    } else if (_.isPlainObject(rate)) {
      Object.keys(rate).forEach((status) => {
        precalcBracketTaxes(rate[status]);
      });
    }
  }

  function precalcBracketTaxes(tax) {
    for (let i = 0, len = tax.length, max = 0; i < len - 1; i += 1) {
      max += (tax[i + 1][MIN] - tax[i][MIN]) * tax[i][RATE];
      tax[i][MAX_TAX] = Math.round(max);
    }
  }

  function calcTaxCredit({ amount }, income) {
    let refund = 0;

    if (_.isArray(amount)) {
      _(amount).some((bracket) => {
        if (bracket[0] > income) {
          return true;
        }

        refund = bracket[1];
        return false;
      });
    }

    return refund;
  }

  function calcTaxCredits(credits, income, filingStatus, taxAmount, withoutTaxCap) {
    let total = 0;

    _(credits)
      .sort(({ isRefundable }) => (isRefundable ? 1 : -1))
      .forEach((credit) => {
        if (_.isPlainObject(credit.amount)) {
          credit.amount = credit.amount[filingStatus];
        }

        const addedAmount = calcTaxCredit(credit, income);

        if (credit.isRefundable || withoutTaxCap) {
          total += addedAmount;
        } else {
          total = Math.min(taxAmount, addedAmount + total);
        }
      });

    return total;
  }

  function calcTax(tax, income, filingStatus, credits) {
    let total;

    if (_.isNumber(tax)) {
      total = tax * income;
    } else if (_.isArray(tax)) {
      total = calcEffectiveTax(tax, income, 0, 0);
    } else if (_.isPlainObject(tax)) {
      total = calcEffectiveTax(tax[filingStatus], income, 0, 0);
    }

    if (credits) {
      total -= calcTaxCredits(credits, income, filingStatus, total);
    }

    return total;
  }

  function calcEffectiveTax(tax, income, bracket, balance) {
    const numBrackets = tax.length;
    const bracketMin = tax[bracket][MIN];
    let nextBracketMin = -1;

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
      bracket += 1;
      return calcEffectiveTax(tax, income, bracket, balance);
    }
    balance += (income - bracketMin) * tax[bracket][RATE];
    return Math.round10(balance, -2);
  }

  function createMarginalTaxData(tax, max, filingStatus, credits) {
    max = max || 100000;

    if (_.isNumber(tax)) {
      return createFlatTaxData(tax, max);
    }
    if (_.isArray(tax)) {
      return createMarginalBracketTaxData(tax, max, filingStatus, credits);
    }
    if (_.isPlainObject(tax)) {
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

    if (_.isNumber(tax)) {
      return createFlatTaxData(tax, max);
    }
    if (_.isArray(tax)) {
      return createEffectiveBracketTaxData(tax, max, filingStatus, credits);
    }
    if (_.isPlainObject(tax)) {
      return createEffectiveBracketTaxData(tax[filingStatus], max, filingStatus, credits);
    }

    throw new Error('Cannot create effective tax data');
  }

  function createTotalMarginalTaxData(taxes, totalBracket, max, filingStatus) {
    const data = taxes.map((tax) => {
      const rate = totalBracket.map((bracket) => [
        bracket[MIN],
        calcMarginalTaxRate(tax.rate, bracket[MIN], filingStatus),
      ]);
      precalcBracketTaxes(rate);
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
      const rate = totalBracket.map((bracket) => [
        bracket[MIN],
        calcMarginalTaxRate(tax.rate, bracket[MIN], filingStatus),
      ]);
      precalcBracketTaxes(rate);
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
    let bracketMin;
    let prevBracketMin;
    let thirdPoint;
    let twoThirdPoint;
    let i;
    let len;

    max = parseInt(max, 10);

    const lastPoint = {
      x: max,
      y: calcEffectiveTaxRate(tax, max, filingStatus, credits),
    };

    data.push({
      x: tax[0][MIN],
      y: credits ? calcEffectiveTaxRate(tax, tax[0][MIN] + 1, filingStatus, credits) : tax[0][RATE],
    });

    for (i = 1, len = tax.length; i < len; i += 1) {
      bracketMin = tax[i][MIN];
      prevBracketMin = tax[i - 1][MIN];
      thirdPoint = prevBracketMin + (bracketMin - prevBracketMin) / 3;
      twoThirdPoint = prevBracketMin + ((bracketMin - prevBracketMin) * 2) / 3;

      if (max < bracketMin) {
        break;
      }

      data.push(
        {
          x: thirdPoint,
          y: calcEffectiveTaxRate(tax, thirdPoint, filingStatus, credits),
        },
        {
          x: twoThirdPoint,
          y: calcEffectiveTaxRate(tax, twoThirdPoint, filingStatus, credits),
        },
        {
          x: bracketMin - 10,
          y: calcEffectiveTaxRate(tax, bracketMin - 10, filingStatus, credits),
        },
        {
          x: bracketMin - 1,
          y: calcEffectiveTaxRate(tax, bracketMin - 1, filingStatus, credits),
        },
        {
          x: bracketMin,
          y: calcEffectiveTaxRate(tax, bracketMin, filingStatus, credits),
        },
        {
          x: bracketMin + 10,
          y: calcEffectiveTaxRate(tax, bracketMin + 10, filingStatus, credits),
        },
      );
    }

    prevBracketMin = tax[i - 1][MIN];
    thirdPoint = prevBracketMin + (max - prevBracketMin) / 3;
    twoThirdPoint = prevBracketMin + ((max - prevBracketMin) * 2) / 3;
    data.push(
      {
        x: thirdPoint,
        y: calcEffectiveTaxRate(tax, thirdPoint, filingStatus, credits),
      },
      {
        x: twoThirdPoint,
        y: calcEffectiveTaxRate(tax, twoThirdPoint, filingStatus, credits),
      },
      lastPoint,
    );

    return data;
  }

  function createTakeHomePayData(taxes, totalBracket, max, filingStatus) {
    const data = createTotalEffectiveTaxData(taxes, totalBracket, max, filingStatus);

    for (let i = 0, len = data.length; i < len; i += 1) {
      data[i].y = 1 - data[i].y;
    }

    return data;
  }

  function calcTotalMarginalTaxBrackets(taxes, max, filingStatus) {
    let brackets = [];

    _(taxes).forEach((tax) => {
      let copy = [];

      if (_.isArray(tax)) {
        copy = _.cloneDeep(tax);
      } else if (_.isPlainObject(tax)) {
        copy = _.cloneDeep(tax[filingStatus]);
      }

      brackets.push(...copy);
    });

    brackets.sort((a, b) => a[MIN] - b[MIN]);

    brackets = _.uniq(brackets, (bracket) => bracket[MIN]);

    brackets = _.map(brackets, (bracket) => {
      let totalRate = 0;

      for (let i = 0, len = taxes.length; i < len; i += 1) {
        totalRate += calcMarginalTaxRate(taxes[i], bracket[MIN], filingStatus);
      }

      return [bracket[MIN], totalRate];
    });

    precalcBracketTaxes(brackets);
    return brackets;
  }

  function calcMarginalTaxRate(tax, income, filingStatus, credits) {
    if (!_(credits).isEmpty() && calcEffectiveTaxRate(tax, income, filingStatus, credits) <= 0) {
      return 0;
    }

    if (_.isNumber(tax)) {
      return tax;
    }
    if (_.isPlainObject(tax)) {
      tax = tax[filingStatus];
    }

    let i;
    let len;

    for (i = 0, len = tax.length; i < len - 1; i += 1) {
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
    const rate = calcTax(tax, income, filingStatus, credits) / income;
    return Math.max(rate, 0);
  }

  function calcTotalMarginalTaxRate(taxes, income, filingStatus) {
    const rate = _(taxes).reduce((total, tax) => {
      const added = calcMarginalTaxRate(tax.rate, income, filingStatus, tax.credits);
      return total + added;
    }, 0);

    return Math.max(rate, 0);
  }

  function calcTotalEffectiveTaxRate(taxes, income, filingStatus) {
    const rate = _(taxes).reduce((total, tax) => {
      const added = calcEffectiveTaxRate(tax.rate, income, filingStatus, tax.credits);
      return total + added;
    }, 0);

    return Math.max(rate, 0);
  }

  function createDeductionBracketData(deduction, filingStatus) {
    let { amount } = deduction;
    let { phaseout } = deduction;
    const brackets = [];
    let steps;
    let i;

    if (_.isPlainObject(amount)) {
      amount = amount[filingStatus];
    }

    if (_.isPlainObject(phaseout)) {
      phaseout = phaseout[filingStatus] || phaseout;
      steps = Math.ceil(amount - phaseout.minimum) / phaseout.reduction;
      brackets.push([0, amount]);
      for (i = 1; i <= steps; i += 1) {
        brackets.push([phaseout.start + phaseout.step * i, amount - phaseout.reduction * i]);
      }
    } else if (_.isNumber(amount)) {
      brackets.push([0, amount]);
    } else if (_.isArray(amount)) {
      brackets.push(...amount);
    }

    return brackets;
  }

  function createDeductionsData(deductions, filingStatus) {
    if (!deductions.length) {
      return [];
    }

    const allBrackets = deductions.map((deduction) => (
      createDeductionBracketData(deduction, filingStatus)
    ));

    const deductionMap = {};
    let incomeSteps = [];
    let currentStep;

    if (allBrackets.length <= 1) {
      return allBrackets[0];
    }

    _(allBrackets).forEach((brackets) => {
      _(brackets).forEach((bracket) => {
        currentStep = bracket[0];
        deductionMap[currentStep] = 0;
        incomeSteps.push(currentStep);
      });
    });

    incomeSteps = _.uniq(
      incomeSteps.sort((a, b) => a - b),
      true,
    );

    _(allBrackets).forEach((brackets) => {
      const bracketLen = brackets.length;
      _(brackets).forEach((bracket, i) => {
        currentStep = bracket[0];
        incomeSteps.forEach((step) => {
          if (currentStep <= step && (i >= bracketLen - 1 || brackets[i + 1][0] > step)) {
            deductionMap[step] += bracket[1];
          }
        });
      });
    });

    return Object.keys(deductionMap)
      .map((step) => [parseInt(step, 10), deductionMap[step]])
      .sort((a, b) => a[0] - b[0]);
  }

  function modifyDependentsDeduction(deduction, filingStatus, numDependents) {
    const copy = _.cloneDeep(deduction);
    let { amount } = deduction;

    if (_.isPlainObject(amount)) {
      amount = amount[filingStatus];
    }

    if (_.isNumber(amount)) {
      copy.amount = amount * numDependents;
    } else if (_.isArray(amount)) {
      copy.amount = amount.map((bracket) => [bracket[0], bracket[1] * numDependents]);
    }

    return copy;
  }

  function modifyRetirementSaversCredit(credit, filingStatus, contribution) {
    const copy = _.cloneDeep(credit);
    let { rate } = credit;

    contribution = Number.isNaN(contribution) ? 0 : contribution;

    if (_.isPlainObject(rate)) {
      rate = rate[filingStatus];
    }

    copy.amount = rate.map((bracket) => [
      bracket[0],
      Math.min(credit.maximum, contribution * bracket[1]),
    ]);

    return copy;
  }

  function applyDeductionsToTaxBracket(tax, filingStatus, deductions) {
    const deductionsData = createDeductionsData(deductions, filingStatus).reverse();
    let copy;
    let currentDeductionBracket;

    if (!deductionsData.length) {
      copy = _.cloneDeep(tax);
    } else {
      copy = [[0, 0, 0]];

      if (_.isNumber(tax)) {
        copy.push([0, tax]);
      }
      if (_.isArray(tax)) {
        copy.push(..._.cloneDeep(tax));
      } else if (_.isPlainObject(tax)) {
        copy.push(..._.cloneDeep(tax[filingStatus]));
      }

      _(copy).forEach((taxBracket, i) => {
        if (i === 0) {
          return;
        }

        _(deductionsData).some((bracket) => {
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

    const copy = _.cloneDeep(tax);

    if (!credits.length) {
      return copy;
    }

    _(credits).forEach((credit) => {
      let { amount } = credit;
      if (_.isPlainObject(amount)) {
        amount = amount[filingStatus];
      }

      _(amount).forEach((creditBracket) => {
        const isAdded = _(copy).some((taxBracket, i) => {
          if (taxBracket[MIN] === creditBracket[MIN]) {
            return true;
          }

          if (taxBracket[MIN] > creditBracket[MIN]) {
            copy.push([creditBracket[MIN], copy[i - 1][RATE]]);
            return true;
          }

          return false;
        });

        if (!isAdded) {
          copy.push([creditBracket[MIN], copy[tax.length - 1][RATE]]);
        }
      });

      copy.sort((a, b) => a[MIN] - b[MIN]);
    });

    precalcBracketTaxes(copy);

    const final = [];

    _(copy).some((bracket, i) => {
      final.push(_.cloneDeep(bracket));
      if (i === copy.length - 1) {
        return true;
      }

      const maxTax = bracket[MAX_TAX];
      const creditAtMax = calcTaxCredits(credits, copy[i + 1][MIN] - 1, filingStatus, maxTax, true);
      const minTax = i === 0 ? 0 : copy[i - 1][MAX_TAX];
      const creditAtMin = calcTaxCredits(credits, copy[i][MIN], filingStatus, minTax, true);
      const coversMax = creditAtMax - maxTax > 0;
      const coversMin = creditAtMin - minTax > 0;
      let incomeStep;

      if (coversMax !== coversMin) {
        incomeStep = Math.round((creditAtMin - minTax) / bracket[RATE]);
        final.push([bracket[MIN] + incomeStep + 1, bracket[RATE]]);
      }

      return false;
    });

    final.sort((a, b) => a[MIN] - b[MIN]);

    precalcBracketTaxes(final);
    return final;
  }

  function modifyTaxBracket(tax, filingStatus, deductions, credits) {
    let finalTax = applyDeductionsToTaxBracket(tax, filingStatus, deductions);
    finalTax = applyCreditsToTaxBracket(finalTax, filingStatus, credits);

    return finalTax;
  }

  return service;
}

module.exports = taxService;
