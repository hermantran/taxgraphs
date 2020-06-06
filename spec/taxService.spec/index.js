import _ from 'lodash';
import TaxService from '../../assets/js/services/taxService';
import applyCreditsToTaxBracketSpecs from './applyCreditsToTaxBracket.spec';
import applyDeductionsToTaxBracket from './applyDeductionsToTaxBracket.spec';
import calcTaxSpecs from './calcTax.spec';
import calcTaxCreditSpecs from './calcTaxCredit.spec';
import calcTaxCreditsSpecs from './calcTaxCredits.spec';
import calcEffectiveTaxRateSpecs from './calcEffectiveTaxRate.spec';
import calcMarginalTaxRateSpecs from './calcMarginalTaxRate.spec';
import createDeductionBracketDataSpecs from './createDeductionBracketData.spec';
import createDeductionsDataSpecs from './createDeductionsData.spec';
import modifyDependentsDeductionSpecs from './modifyDependentsDeduction.spec';
import modifyRetirementSaversCreditSpecs from './modifyRetirementSaversCredit.spec';
import preprocessTaxSpecs from './preprocessTax.spec';

const taxService = new TaxService(_);

describe('taxService', () => {
  applyCreditsToTaxBracketSpecs(taxService);
  applyDeductionsToTaxBracket(taxService);

  calcEffectiveTaxRateSpecs(taxService);
  calcMarginalTaxRateSpecs(taxService);
  
  calcTaxSpecs(taxService);
  calcTaxCreditSpecs(taxService);
  calcTaxCreditsSpecs(taxService);
  createDeductionBracketDataSpecs(taxService);
  createDeductionsDataSpecs(taxService);
  modifyDependentsDeductionSpecs(taxService);
  modifyRetirementSaversCreditSpecs(taxService);
  preprocessTaxSpecs(taxService);
});
