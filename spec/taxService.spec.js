'use strict';

var _ = require('lodash'),
    TaxService = require('../assets/js/services/taxService'),
    taxService = new TaxService(_),
    specHelper = require('./specHelper'),
    statuses = specHelper.filingStatuses;
    
describe('taxService', function() {
  describe('preprocessTaxes()', function() {
    it('should not modify flat tax rates', function() {
      var flatRate = { rate: 0.5 };
      var statusFlatRate = { 
        single: { rate: 0.2 }, 
        married: { rate: 0.1 }
      };
      expect(taxService.preprocessTaxes(flatRate)).toEqual(flatRate);
      expect(taxService.preprocessTaxes(statusFlatRate)).toEqual(statusFlatRate);
    });

    it('should add the total tax to each marginal tax bracket except the last bracket', function() {
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

  describe('calcTaxCredit()', function() {
    it ('should calculate the correct tax credit based on the income', function() {
      var credit = { amount: [[0, 100], [10000, 50], [20000, 0]] };

      expect(taxService.calcTaxCredit(credit, 9999)).toEqual(100);
      expect(taxService.calcTaxCredit(credit, 10000)).toEqual(50);
      expect(taxService.calcTaxCredit(credit, 20001)).toEqual(0);
    });
  });

  describe('calcTaxCredits()', function() {
    it ('should calculate the total tax credit based on the income and credit refundable status', function() {
      var credits = [
        { amount: [[0, 200], [10000, 100]], isRefundable: true },
        { amount: [[0, 100], [10000, 50]], isRefundable: false },
      ];

      expect(taxService.calcTaxCredits(credits, 10, statuses.single, 1)).toEqual(201);
      expect(taxService.calcTaxCredits(credits, 500, statuses.single, 50)).toEqual(250);
      expect(taxService.calcTaxCredits(credits, 2000, statuses.single, 200)).toEqual(300);
    });
  });

  describe('createDeductionBracketData()', function() {
    it('should create the correct bracket data for flat deductions', function() {
      var statusFlatDeduction = { 
        amount: { single: 1000, married: 2000 }
      };
      expect(taxService.createDeductionBracketData({ amount: 1000 })).toEqual([[0, 1000]]);
      expect(taxService.createDeductionBracketData(statusFlatDeduction, statuses.single)).toEqual([[0, 1000]]);
      expect(taxService.createDeductionBracketData(statusFlatDeduction, statuses.married)).toEqual([[0, 2000]]);
    });

    it('should create the correct bracket data for deductions with simple phaseouts', function() {
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

    it('should create the correct bracket data for deductions with step phaseouts', function() {
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
    it('should combine all deductions into one bracket', function() {
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

  describe('modifyDependentsDeduction()', function() {
    it('should modify a flat dependents deduction correctly', function() {
      var deduction = { amount: { single: 400, married: 800 } };
      expect(taxService.modifyDependentsDeduction(deduction, statuses.married, 3)).toEqual({
        amount: 2400
      });
    });

    it('should modify a dependents deduction with simple phaseouts correctly', function() {
      var deduction = { amount: [[0, 4000], [5000, 2000], [10000, 1000]] };
      expect(taxService.modifyDependentsDeduction(deduction, statuses.married, 2)).toEqual({
        amount: [[0, 8000], [5000, 4000], [10000, 2000]]
      });
    });
  });

  describe('modifyRetirementSaversCredit()', function() {
    it('should modify the credit maxmium correctly based on the contribution', function() {
      var credit = {
        rate: [
          [0, 0.3],
          [1001, 0.2],
          [2001, 0.1],
          [3001, 0]
        ],
        maximum: 250,
        isRefundable: false
      };
      expect(taxService.modifyRetirementSaversCredit(credit, statuses.single, 1000)).toEqual({
        amount: [
          [0, 250],
          [1001, 200],
          [2001, 100],
          [3001, 0]
        ],
        rate: [
          [0, 0.3],
          [1001, 0.2],
          [2001, 0.1],
          [3001, 0]
        ],
        maximum: 250,
        isRefundable: false
      })
    });
  });

  describe('applyCreditsToTaxBracket()', function() {
    it('should add additional brackets based on the minimum points for the credits', function() {
      var credits = [
        { amount: [[0, 1000], [5000, 700], [10000, 100], [18000, 50], [30000, 0]], isRefundable: false },
        { amount: [[0, 100], [25000, 0]], isRefundable: false }
      ];

      var tax = [
        [0, 0.1, 400],
        [4000, 0.15, 1300],
        [10000, 0.2, 3300],
        [20000, 0.3],
      ];

      expect(taxService.applyCreditsToTaxBracket(tax, statuses.single, credits)).toEqual([
        [0, 0.1, 400],
        [4000, 0.15, 550],
        [5000, 0.15, 800],
        [6668, 0.15, 1300],
        [10000, 0.2, 2900],
        [18000, 0.2, 3300],
        [20000, 0.3, 4800],
        [25000, 0.3, 6300],
        [30000, 0.3] 
      ]);
    });
  });

  describe('applyDeductionsToTaxBracket()', function() {
    it('should apply the deductions correctly to the tax brackets', function() {
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

      expect(taxService.applyDeductionsToTaxBracket(tax, statuses.single, deductions)).toEqual([
        [0, 0, 0],
        [6500, 0.1, 685],
        [13350, 0.2, 2285],
        [21350, 0.3]
      ]);
    });
  });
});