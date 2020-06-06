import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => { 
  describe('applyDeductionsToTaxBracket()', () => {
    it('should apply the deductions correctly to the tax brackets', () => {
      const deductions = [
        {
          amount: [
            [0, 4000],
            [5000, 2000],
            [12000, 0],
          ],
        },
        {
          amount: [
            [0, 1000],
            [3000, 500],
            [6000, 250],
          ],
        },
        {
          amount: [
            [0, 500],
            [5000, 300],
            [10000, 100],
          ],
        },
        { amount: 1000 },
      ];

      const tax = [
        [0, 0.1, 1000],
        [10000, 0.2, 3000],
        [20000, 0.3],
      ];

      expect(taxService.applyDeductionsToTaxBracket(tax, statuses.single, deductions)).toEqual([
        [0, 0, 0],
        [6500, 0.1, 685],
        [13350, 0.2, 2285],
        [21350, 0.3],
      ]);
    });
  });
};
