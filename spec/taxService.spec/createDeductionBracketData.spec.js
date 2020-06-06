import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => {
  describe('createDeductionBracketData()', () => {
    it('should create the correct bracket data for flat deductions', () => {
      const statusFlatDeduction = {
        amount: { single: 1000, married: 2000 },
      };
      expect(taxService.createDeductionBracketData({ amount: 1000 })).toEqual([[0, 1000]]);
      expect(taxService.createDeductionBracketData(statusFlatDeduction, statuses.single)).toEqual([
        [0, 1000],
      ]);
      expect(taxService.createDeductionBracketData(statusFlatDeduction, statuses.married)).toEqual([
        [0, 2000],
      ]);
    });

    it('should create the correct bracket data for deductions with simple phaseouts', () => {
      const bracketDeduction = {
        amount: [
          [0, 4000],
          [5000, 2000],
        ],
      };
      const statusBracketDeduction = {
        amount: {
          single: [
            [0, 5000],
            [10000, 1000],
          ],
          married: [
            [0, 10000],
            [10000, 2000],
          ],
        },
      };
      expect(taxService.createDeductionBracketData(bracketDeduction)).toEqual(
        bracketDeduction.amount,
      );
      expect(
        taxService.createDeductionBracketData(statusBracketDeduction, statuses.single),
      ).toEqual(statusBracketDeduction.amount.single);
      expect(
        taxService.createDeductionBracketData(statusBracketDeduction, statuses.married),
      ).toEqual(statusBracketDeduction.amount.married);
    });

    it('should create the correct bracket data for deductions with step phaseouts', () => {
      const stepDeduction = {
        amount: 175,
        phaseout: {
          single: {
            start: 10000,
            step: 2500,
            reduction: 50,
            minimum: 25,
          },
          married: {
            start: 20000,
            step: 2500,
            reduction: 50,
            minimum: 25,
          },
        },
      };

      expect(taxService.createDeductionBracketData(stepDeduction, statuses.single)).toEqual([
        [0, 175],
        [12500, 125],
        [15000, 75],
        [17500, 25],
      ]);
      expect(taxService.createDeductionBracketData(stepDeduction, statuses.married)).toEqual([
        [0, 175],
        [22500, 125],
        [25000, 75],
        [27500, 25],
      ]);
    });
  });
};
