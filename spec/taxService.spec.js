'use strict';

var _ = require('lodash'),
    TaxService = require('../assets/js/services/taxService'),
    taxService = new TaxService(_),
    specHelper = require('./specHelper'),
    statuses = specHelper.filingStatuses;
    
describe('taxService', function() {
  describe('preprocessTaxes()', function() {
    it('doesn\'t modify flat tax rates', function() {
      var flatRate = { rate: 0.5 };
      var statusFlatRate = { 
        single: { rate: 0.2 }, 
        married: { rate: 0.1 }
      };
      expect(taxService.preprocessTaxes(flatRate)).toEqual(flatRate);
      expect(taxService.preprocessTaxes(statusFlatRate)).toEqual(statusFlatRate);
    });

    it('adds the total tax to each marginal tax bracket except the last bracket', function() {
      expect(taxService.preprocessTaxes({ rate: [[0, 0.1], [1000, 0.2]] }))
        .toEqual({ rate: [[0, 0.1, 100], [1000, 0.2]] });

      expect(taxService.preprocessTaxes({ 
        single: { rate: [[0, 0.1], [1000, 0.2]] },
        married: { rate: [[0, 0.05], [1000, 0.01]] }
      })).toEqual({ 
        single: { rate: [[0, 0.1, 100], [1000, 0.2]] },
        married: { rate: [[0, 0.05, 50], [1000, 0.01]] }
      });
    });
  });

  describe('createDeductionBracketData()', function() {
    it('creates the correct bracket data for flat deductions', function() {
      var statusFlatDeduction = { 
        amount: { single: 1000, married: 2000 }
      };
      expect(taxService.createDeductionBracketData({ amount: 1000 })).toEqual([[0, 1000]]);
      expect(taxService.createDeductionBracketData(statusFlatDeduction, statuses.single)).toEqual([[0, 1000]]);
      expect(taxService.createDeductionBracketData(statusFlatDeduction, statuses.married)).toEqual([[0, 2000]]);
    });

    it('creates the correct bracket data for deductions with simple phaseouts', function() {
      var bracketDeduction = { amount: [[0, 4000], [5000, 2000]] };
      var statusBracketDeduction = { 
        amount: { 
          single: [[0, 5000], [10000, 1000]],
          married: [[0, 10000], [10000, 2000]] 
        }
      };
      expect(taxService.createDeductionBracketData(bracketDeduction)).toEqual(bracketDeduction.amount);
      expect(taxService.createDeductionBracketData(statusBracketDeduction, statuses.single))
        .toEqual(statusBracketDeduction.amount.single);
      expect(taxService.createDeductionBracketData(statusBracketDeduction, statuses.married))
        .toEqual(statusBracketDeduction.amount.married);
    });

    it('creates the correct bracket data for deductions with step phaseouts', function() {
      var stepDeduction = {
        amount: 175,
        phaseout: {
          single: {
            start: 10000,
            step: 2500,
            reduction: 50,
            minimum: 25
          },
          married: {
            start: 20000,
            step: 2500,
            reduction: 50,
            minimum: 25
          }
        }
      };

      expect(taxService.createDeductionBracketData(stepDeduction, statuses.single)).toEqual([
        [0, 175], [12500, 125], [15000, 75], [17500, 25]
      ]);
      expect(taxService.createDeductionBracketData(stepDeduction, statuses.married)).toEqual([
        [0, 175], [22500, 125], [25000, 75], [27500, 25]
      ]);
    });
  });

  describe('createDeductionsData()', function() {
    it('combines all deductions into one bracket', function() {
      var deductions = [
        { amount: [[0, 4000], [5000, 2000], [12000, 0]] },
        { amount: [[0, 1000], [3000, 500], [6000, 250]] },
        { amount: [[0, 500], [5000, 300], [10000, 100]] },
        { amount: 1000 }
      ];

      expect(taxService.createDeductionsData(deductions, statuses.single)).toEqual([
        [0, 6500], [3000, 6000], [5000, 3800], [6000, 3550], [10000, 3350], [12000, 1350]
      ]);
    });
  });

  describe('modifyTaxBracket()', function() {
    it('modifies the tax brackets against the deductions correctly', function() {
      var deductions = [
        { amount: [[0, 4000], [5000, 2000], [12000, 0]] },
        { amount: [[0, 1000], [3000, 500], [6000, 250]] },
        { amount: [[0, 500], [5000, 300], [10000, 100]] },
        { amount: 1000 }
      ];

      var tax = [
        [0, 0.1, 1000], 
        [10000, 0.2, 3000],
        [20000, 0.3]
      ];

      expect(taxService.modifyTaxBracket(tax, statuses.single, deductions)).toEqual([
        [0, 0, 0],
        [6500, 0.1, 685],
        [13350, 0.2, 2285],
        [21350, 0.3]
      ]);
    });
  });
});