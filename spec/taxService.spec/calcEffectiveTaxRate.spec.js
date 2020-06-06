import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => { 
  describe('calcEffectiveTaxRate()', () => {
  	it('should return the correct effective tax rate for a flat tax', () => {
      expect(taxService.calcEffectiveTaxRate(0.25, 100000, statuses.married)).toEqual(0.25);
    });

    it('should return the correct effective tax rate for a set of marginal tax rates', () => {
      const tax = [
        [0, 0.1, 1000],
        [10000, 0.5],
      ];

      expect(taxService.calcEffectiveTaxRate(tax, 100, statuses.single)).toEqual(0.1);
      expect(taxService.calcEffectiveTaxRate(tax, 1000, statuses.single)).toEqual(0.1);
      expect(taxService.calcEffectiveTaxRate(tax, 100000, statuses.single)).toEqual(0.46);
    });

    it('should return the correct effective tax rate for sets of marginal tax rates for different filing statuses', () => {
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

      expect(taxService.calcEffectiveTaxRate(tax, 100000, statuses.single)).toEqual(0.295);
      expect(taxService.calcEffectiveTaxRate(tax, 100000, statuses.married)).toEqual(0.29);
    });

    it('should return the correct effective tax rate with credits applied', () => {
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

      expect(taxService.calcEffectiveTaxRate(tax, 200, statuses.married, credits)).toEqual(0);
      expect(taxService.calcEffectiveTaxRate(tax, 2000, statuses.single, credits)).toEqual(0.05);
      expect(taxService.calcEffectiveTaxRate(tax, 20000, statuses.married, credits)).toEqual(0.2875);
    });
  });
};
