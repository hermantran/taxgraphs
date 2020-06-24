const cloneDeep = require('lodash/cloneDeep');
const isArray = require('lodash/isArray');
const isNumber = require('lodash/isNumber');
const isPlainObject = require('lodash/isPlainObject');
const sortedUniq = require('lodash/sortedUniq');
const uniqWith = require('lodash/uniqWith');
Number.isNaN = require('is-nan');
require('../lib/Math.round10');

/* eslint-disable no-use-before-define, no-param-reassign */
/* @ngInject */
function taxService() {
  const service = {};

  // enum to represent tax bracket indices
  const taxBracketEnum = {
    MIN: 0,
    RATE: 1,
    MAX_TAX: 2,
  };
  const { MIN, RATE, MAX_TAX } = taxBracketEnum;

  // enum to represent deduction bracket indices
  const deductionBracketEnum = {
    MIN: 0,
    AMOUNT: 1,
  };

  service.taxBracketEnum = taxBracketEnum;
  service.preprocessTaxes = preprocessTaxes;
  service.precalcBracketTaxes = precalcBracketTaxes;
  service.calcAmtIncome = calcAmtIncome;
  service.calcIsosForAmtIncome = calcIsosForAmtIncome;
  service.calcIsosToAvoidAmt = calcIsosToAvoidAmt;
  service.calcAmtTax = calcAmtTax;
  service.calcAmtEffectiveTaxRate = calcAmtEffectiveTaxRate;
  service.calcDeductionFromTaxBracket = calcDeductionFromTaxBracket;
  service.calcTaxCredit = calcTaxCredit;
  service.calcTaxCredits = calcTaxCredits;
  service.calcTax = calcTax;
  service.calcTotalMarginalTaxBrackets = calcTotalMarginalTaxBrackets;
  service.calcMarginalTaxRate = calcMarginalTaxRate;
  service.calcEffectiveTaxRate = calcEffectiveTaxRate;
  service.calcTotalMarginalTaxRate = calcTotalMarginalTaxRate;
  service.calcTotalEffectiveTaxRate = calcTotalEffectiveTaxRate;
  service.createDeductionsData = createDeductionsData;
  service.createDeductionBracketData = createDeductionBracketData;
  service.applyCreditsToTaxBracket = applyCreditsToTaxBracket;
  service.applyDeductionsToTaxBracket = applyDeductionsToTaxBracket;
  service.modifyDependentsDeduction = modifyDependentsDeduction;
  service.modifyRetirementSaversCredit = modifyRetirementSaversCredit;
  service.modifyTaxBracket = modifyTaxBracket;

  function preprocessTaxes(taxes, rateProp) {
    const processedTaxes = cloneDeep(taxes);
    rateProp = rateProp || 'rate';

    Object.keys(taxes).forEach((prop) => {
      if (prop === rateProp) {
        processedTaxes[prop] = preprocessRateProp(taxes[prop]);
      } else if (isPlainObject(processedTaxes[prop])) {
        processedTaxes[prop] = preprocessTaxes(taxes[prop]);
      }
    });

    return processedTaxes;
  }

  function preprocessRateProp(rate) {
    let processedRate;

    if (isArray(rate)) {
      processedRate = precalcBracketTaxes(rate);
    } else if (isPlainObject(rate)) {
      processedRate = Object.keys(rate).reduce((acc, status) => {
        acc[status] = precalcBracketTaxes(rate[status]);
        return acc;
      }, {});
    } else {
      processedRate = rate;
    }

    return processedRate;
  }

  function precalcBracketTaxes(tax) {
    const calculatedBracketTaxes = [...tax];
    const len = tax.length;

    for (let i = 0, max = 0; i < len - 1; i += 1) {
      max += (tax[i + 1][MIN] - tax[i][MIN]) * tax[i][RATE];
      calculatedBracketTaxes[i][MAX_TAX] = Math.round(max);
    }

    return calculatedBracketTaxes;
  }

  function calcAmtIncome(income, strikePrice, optionValue, isos) {
    if (optionValue <= strikePrice) {
      return income;
    }

    return income + (isos * (optionValue - strikePrice));
  }

  function calcIsosForAmtIncome(amtIncome, income, strikePrice, optionValue) {
    const isos = Math.round((amtIncome - income) / (optionValue - strikePrice));
    return Math.max(isos, 0);
  }

  function calcAmtTax(tax, income, filingStatus, strikePrice, optionValue, isos) {
    if (isPlainObject(tax)) {
      tax = tax[filingStatus];
    }

    if (!isArray(tax)) {
      throw new Error(`Cannot calculate AMT of type ${typeof tax}`);
    }

    const amtIncome = calcAmtIncome(income, strikePrice, optionValue, isos);
    return calcEffectiveTax(tax, amtIncome, 0, 0);
  }

  function calcAmtEffectiveTaxRate(tax, income, filingStatus, strikePrice, optionValue, isos) {
    if (income < 1) {
      return 0;
    }
    const rate = calcAmtTax(tax, income, filingStatus, strikePrice, optionValue, isos) / income;
    return Math.max(rate, 0);
  }

  function calcIsosToAvoidAmt(tax, income, filingStatus, strikePrice, optionValue, taxAmount) {
    const args = [tax, income, filingStatus, strikePrice, optionValue];
    const baseDeduction = calcDeductionFromTaxBracket(tax, filingStatus);
    const baseIncome = income > baseDeduction ? income : baseDeduction;
    const baseIsos = calcIsosForAmtIncome(baseIncome, income, strikePrice, optionValue);
    const baseAmtTax = calcAmtTax(...args, baseIsos);

    // AMT has a higher marginal rate and exemption phaseout,
    // so use a naive marginal tax for first guess
    const naiveMarginalTax = calcAmtTax(...args, baseIsos + 1) - baseAmtTax;
    const buffer = (10 * naiveMarginalTax);
    let isosToAvoidAmt = baseIsos + (
      Math.floor((taxAmount - baseAmtTax - buffer) / naiveMarginalTax)
    );

    if (isosToAvoidAmt <= 0) {
      return 0;
    }

    let currentAmtTax = calcAmtTax(...args, isosToAvoidAmt);
    let iterations = 0;

    while ((currentAmtTax - taxAmount) < 0 && iterations < 100) {
      iterations += 1;
      isosToAvoidAmt += 1;
      currentAmtTax = calcAmtTax(...args, isosToAvoidAmt);
    }

    return isosToAvoidAmt;
  }

  function calcDeductionFromTaxBracket(tax, filingStatus) {
    if (isPlainObject(tax)) {
      tax = tax[filingStatus];
    }

    if (!isArray(tax)) {
      throw new Error(`Cannot calculate deduction from tax bracket of type ${typeof tax}`);
    }

    // Deductions create a 0% rate in the first bracket, so get income min of next bracket
    if (tax[0][RATE] === 0) {
      return tax[1][MIN];
    }

    return 0;
  }

  function calcTaxCredit(credit, income) {
    const { amount } = credit;
    let refund = 0;

    if (isArray(amount)) {
      amount.some((bracket) => {
        if (bracket[0] > income) {
          return true;
        }

        refund = bracket[deductionBracketEnum.AMOUNT];
        return false;
      });
    } else {
      throw new Error(`Cannot calculate tax credit of type ${typeof credit}`);
    }

    return refund;
  }

  function calcTaxCredits(credits, income, filingStatus, taxAmount, withoutTaxCap) {
    let total = 0;

    credits
      .sort(({ isRefundable }) => (isRefundable ? 1 : -1))
      .forEach((credit) => {
        if (isPlainObject(credit.amount)) {
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

    if (isNumber(tax)) {
      total = tax * income;
    } else if (isArray(tax)) {
      total = calcEffectiveTax(tax, income, 0, 0);
    } else if (isPlainObject(tax)) {
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

  function calcTotalMarginalTaxBrackets(taxes, max, filingStatus) {
    let brackets = [];

    const rates = taxes.map(({ rate }) => rate);

    rates.forEach((tax) => {
      let copy = [];

      if (isArray(tax)) {
        copy = cloneDeep(tax);
      } else if (isPlainObject(tax)) {
        copy = cloneDeep(tax[filingStatus]);
      }

      brackets.push(...copy);
    });

    // Sort by income min, then by rate
    brackets.sort((a, b) => {
      const minDiff = a[MIN] - b[MIN];
      if (minDiff !== 0) {
        return minDiff;
      }

      return a[RATE] - b[RATE];
    });

    brackets = uniqWith(brackets, (a, b) => a[MIN] === b[MIN]);

    brackets = brackets.map((bracket) => {
      let totalRate = 0;

      for (let i = 0, len = taxes.length; i < len; i += 1) {
        totalRate += calcMarginalTaxRate(
          taxes[i].rate, bracket[MIN], filingStatus, taxes[i].credits,
        );
      }

      return [bracket[MIN], totalRate];
    });

    return precalcBracketTaxes(brackets);
  }

  function calcMarginalTaxRate(tax, income, filingStatus, credits) {
    if (
      credits
      && credits.length
      && calcEffectiveTaxRate(tax, income, filingStatus, credits) <= 0
    ) {
      return 0;
    }

    if (isNumber(tax)) {
      return tax;
    }
    if (isPlainObject(tax)) {
      tax = tax[filingStatus];
    }

    const len = tax.length;

    for (let i = 0; i < len - 1; i += 1) {
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
    const rate = taxes.reduce((total, tax) => {
      const added = calcMarginalTaxRate(tax.rate, income, filingStatus, tax.credits);
      return total + added;
    }, 0);

    return Math.max(rate, 0);
  }

  function calcTotalEffectiveTaxRate(taxes, income, filingStatus) {
    const rate = taxes.reduce((total, tax) => {
      const added = calcEffectiveTaxRate(tax.rate, income, filingStatus, tax.credits);
      return total + added;
    }, 0);

    return Math.max(rate, 0);
  }

  function createDeductionBracketData(deduction, filingStatus) {
    let { amount, phaseout } = deduction;
    const brackets = [];

    if (isPlainObject(amount)) {
      amount = amount[filingStatus];
    }

    if (isPlainObject(phaseout)) {
      phaseout = phaseout[filingStatus] || phaseout;
      const steps = Math.ceil(amount - phaseout.minimum) / phaseout.reduction;
      brackets.push([0, amount]);
      for (let i = 1; i <= steps; i += 1) {
        brackets.push([phaseout.start + phaseout.step * i, amount - phaseout.reduction * i]);
      }
    } else if (isNumber(amount)) {
      brackets.push([0, amount]);
    } else if (isArray(amount)) {
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

    allBrackets.forEach((brackets) => {
      brackets.forEach((bracket) => {
        ([currentStep] = bracket);
        deductionMap[currentStep] = 0;
        incomeSteps.push(currentStep);
      });
    });

    incomeSteps = sortedUniq(incomeSteps.sort((a, b) => a - b));

    allBrackets.forEach((brackets) => {
      const bracketLen = brackets.length;
      brackets.forEach((bracket, i) => {
        ([currentStep] = bracket);
        incomeSteps.forEach((step) => {
          if (currentStep <= step && (i >= bracketLen - 1 || brackets[i + 1][MIN] > step)) {
            deductionMap[step] += bracket[deductionBracketEnum.AMOUNT];
          }
        });
      });
    });

    return Object.keys(deductionMap)
      .map((step) => [parseInt(step, 10), deductionMap[step]])
      .sort((a, b) => a[MIN] - b[MIN]);
  }

  function modifyDependentsDeduction(deduction, filingStatus, numDependents) {
    const copy = cloneDeep(deduction);
    let { amount } = deduction;

    if (isPlainObject(amount)) {
      amount = amount[filingStatus];
    }

    if (isNumber(amount)) {
      copy.amount = amount * numDependents;
    } else if (isArray(amount)) {
      copy.amount = amount.map((bracket) => [bracket[0], bracket[1] * numDependents]);
    }

    return copy;
  }

  function modifyRetirementSaversCredit(credit, filingStatus, contribution) {
    const copy = cloneDeep(credit);
    let { rate } = credit;

    contribution = Number.isNaN(contribution) ? 0 : contribution;

    if (isPlainObject(rate)) {
      rate = rate[filingStatus];
    }

    copy.amount = rate.map((bracket) => [
      bracket[0],
      Math.min(credit.maximum, contribution * bracket[1]),
    ]);

    return copy;
  }

  function applyDeductionsToTaxBracket(tax, filingStatus, deductions) {
    const { AMOUNT } = deductionBracketEnum;
    const deductionsData = createDeductionsData(deductions, filingStatus);

    // No deductions, just retun the tax bracket
    if (!deductionsData.length) {
      return cloneDeep(tax);
    }

    let copy = [[0, 0, 0]];

    if (isNumber(tax)) {
      copy.push([0, tax]);
    }
    if (isArray(tax)) {
      copy.push(...cloneDeep(tax));
    } else if (isPlainObject(tax)) {
      copy.push(...cloneDeep(tax[filingStatus]));
    }

    // Reverse to apply the first deduction bracket that overlaps with the tax bracket
    const sortedDeductionsData = deductionsData.slice().reverse();
    copy.forEach((taxBracket, i) => {
      if (i === 0) {
        return;
      }

      let currentDeductionBracket;

      sortedDeductionsData.some((bracket) => {
        currentDeductionBracket = bracket;
        return bracket[MIN] <= taxBracket[MIN];
      });
      taxBracket[MIN] += currentDeductionBracket[AMOUNT];
    });

    let additionalDeductionBrackets = deductionsData.filter((bracket) => (
      bracket[MIN] > copy[copy.length - 1][MIN]
    ));

    // All deductions phase out before the last tax bracket, return the processed tax brackets
    if (!additionalDeductionBrackets.length) {
      return precalcBracketTaxes(copy);
    }

    // Restrict adding too many brackets for performance
    const MAX_ADDITIONAL_BRACKETS = 100;
    if (additionalDeductionBrackets.length > MAX_ADDITIONAL_BRACKETS) {
      additionalDeductionBrackets = additionalDeductionBrackets.filter((bracket, i) => (
        i % (additionalDeductionBrackets.length / MAX_ADDITIONAL_BRACKETS) === 0
      ));
    }

    // Create a bracket for any deduction brackets that start after the last tax bracket
    const additionalTaxBrackets = additionalDeductionBrackets.map((bracket) => (
      [bracket[MIN], copy[copy.length - 1][RATE]]
    ));

    copy.push(...additionalTaxBrackets);
    copy = precalcBracketTaxes(copy);

    // Increase the max at each bracket by (deduction reduction * tax rate)
    let deductionBracketIndex = 0;
    let accumulatedExtraTax = 0;
    // Set initial deduction amount to the differential between the first two deduction brackets
    let deductionReduction = deductionsData[0][AMOUNT] - deductionsData[1][AMOUNT];
    copy.forEach((bracket, i) => {
      const currentDeductionBracket = additionalDeductionBrackets[deductionBracketIndex];

      if (copy[i][MIN] === currentDeductionBracket[MIN]) {
        const nextDeduction = additionalDeductionBrackets[deductionBracketIndex + 1];
        deductionReduction = nextDeduction
          ? (currentDeductionBracket[AMOUNT] - nextDeduction[AMOUNT])
          : deductionReduction;
        accumulatedExtraTax += (deductionReduction * copy[i - 1][RATE]);
        copy[i - 1][MAX_TAX] += accumulatedExtraTax;
        deductionBracketIndex += 1;
      }
    });

    return copy;
  }

  function applyCreditsToTaxBracket(tax, filingStatus, credits) {
    if (isPlainObject(tax)) {
      tax = tax[filingStatus];
    }

    let copy = cloneDeep(tax);

    if (!credits.length) {
      return copy;
    }

    credits.forEach((credit) => {
      let { amount } = credit;
      if (isPlainObject(amount)) {
        amount = amount[filingStatus];
      }

      amount.forEach((creditBracket) => {
        const isAdded = copy.some((taxBracket, i) => {
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

    copy = precalcBracketTaxes(copy);

    const final = [];

    copy.some((bracket, i) => {
      final.push([...bracket]);
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

    return precalcBracketTaxes(final);
  }

  function modifyTaxBracket(tax, filingStatus, deductions, credits) {
    const taxWithDeductions = applyDeductionsToTaxBracket(tax, filingStatus, deductions);
    const taxWithDeductionsAndCredits = applyCreditsToTaxBracket(
      taxWithDeductions, filingStatus, credits,
    );

    return taxWithDeductionsAndCredits;
  }

  return service;
}

module.exports = taxService;
