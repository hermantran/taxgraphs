import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => {
  describe('calcTax()', () => {
    it('should return the correct tax amount for a flat tax', () => {
      expect(taxService.calcTax(0.25, 100000, statuses.married)).toEqual(25000);
    });

    it('should return the correct tax amount for a set of marginal tax rates', () => {
      const tax = [
        [0, 0.1, 1000],
        [10000, 0.5],
      ];

      expect(taxService.calcTax(tax, 100, statuses.single)).toEqual(10);
      expect(taxService.calcTax(tax, 1000, statuses.single)).toEqual(100);
      expect(taxService.calcTax(tax, 100000, statuses.single)).toEqual(46000);
    });

    it('should return the correct tax amount for sets of marginal tax rates for different filing statuses', () => {
      const tax = {
        single: [
          [0, 0.2, 1000],
          [5000, 0.3],
        ],
        married: [
          [0, 0.2, 2000],
          [10000, 0.3],
        ],
      };

      expect(taxService.calcTax(tax, 100000, statuses.single)).toEqual(29500);
      expect(taxService.calcTax(tax, 100000, statuses.married)).toEqual(29000);
    });

    it('should return the correct tax amount with credits applied', () => {
      const tax = [
        [0, 0.1, 1000],
        [10000, 0.5],
      ];
      const credits = [
        {
          amount: [
            [0, 100],
            [10000, 250],
          ],
          isRefundable: false,
        }
      ];

      expect(taxService.calcTax(tax, 200, statuses.married, credits)).toEqual(0);
      expect(taxService.calcTax(tax, 2000, statuses.single, credits)).toEqual(100);
      expect(taxService.calcTax(tax, 20000, statuses.married, credits)).toEqual(5750);
    });
  });
};
