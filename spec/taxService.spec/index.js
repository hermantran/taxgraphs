import _ from 'lodash';
import TaxService from '../../assets/js/services/taxService';
import applyCreditsToTaxBracketSpecs from './applyCreditsToTaxBracket.spec';
import applyDeductionsToTaxBracketSpecs from './applyDeductionsToTaxBracket.spec';
import calcAmtIncomeSpecs from './calcAmtIncome.spec';
import calcAmtTaxSpecs from './calcAmtTax.spec';
import calcEffectiveTaxRateSpecs from './calcEffectiveTaxRate.spec';
import calcIsosForAmtIncome from './calcIsosForAmtIncome.spec';
import calcIsosToAvoidAmt from './calcIsosToAvoidAmt.spec';
import calcMarginalTaxRateSpecs from './calcMarginalTaxRate.spec';
import calcTaxSpecs from './calcTax.spec';
import calcTaxCreditSpecs from './calcTaxCredit.spec';
import calcTaxCreditsSpecs from './calcTaxCredits.spec';
import createDeductionBracketDataSpecs from './createDeductionBracketData.spec';
import createDeductionsDataSpecs from './createDeductionsData.spec';
import modifyDependentsDeductionSpecs from './modifyDependentsDeduction.spec';
import modifyRetirementSaversCreditSpecs from './modifyRetirementSaversCredit.spec';
import preprocessTaxSpecs from './preprocessTax.spec';

const taxService = new TaxService(_);

describe('taxService', () => {
  applyCreditsToTaxBracketSpecs(taxService);
  applyDeductionsToTaxBracketSpecs(taxService);
  calcAmtIncomeSpecs(taxService);
  calcAmtTaxSpecs(taxService);
  calcEffectiveTaxRateSpecs(taxService);
  calcMarginalTaxRateSpecs(taxService);
  calcIsosForAmtIncome(taxService);
  calcIsosToAvoidAmt(taxService);
  calcTaxSpecs(taxService);
  calcTaxCreditSpecs(taxService);
  calcTaxCreditsSpecs(taxService);
  createDeductionBracketDataSpecs(taxService);
  createDeductionsDataSpecs(taxService);
  modifyDependentsDeductionSpecs(taxService);
  modifyRetirementSaversCreditSpecs(taxService);
  preprocessTaxSpecs(taxService);
});
