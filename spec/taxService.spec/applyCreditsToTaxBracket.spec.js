import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => { 
  describe('applyCreditsToTaxBracket()', () => {
    it('should add additional brackets based on the minimum points for the credits', () => {
      const credits = [
        {
          amount: [
            [0, 1000],
            [5000, 700],
            [10000, 100],
            [18000, 50],
            [30000, 0],
          ],
          isRefundable: false,
        },
        {
          amount: [
            [0, 100],
            [25000, 0],
          ],
          isRefundable: false,
        },
      ];

      const tax = [
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
        [30000, 0.3],
      ]);
    });
  });
};
