import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => {
  describe('calcIsosToAvoidAmt()', () => {
    const tax = {
      single: [
        [0, 0, 0],
        [71700, 0.26, 50648],
        [266500, 0.28],
      ],
      married: [
        [0, 0, 0],
        [111700, 0.26, 50648],
        [306500, 0.28],
      ],
    };

    const stockOptionsA = [
      {
        strikePrice: 2.5,
        optionValue: 16,
        isoAmount: 10000,
      }
    ];

    const stockOptionsB = [
      {
        strikePrice: 10,
        optionValue: 1,
        isoAmount: 10000,
      }
    ];

    it('should return the correct amount of ISOs to avoid AMT', () => {
      expect(taxService.calcIsosToAvoidAmt(tax, 150000, statuses.single, stockOptionsA, 30000)).toEqual(2748);
      expect(taxService.calcIsosToAvoidAmt(tax, 150000, statuses.married, stockOptionsA, 30000)).toEqual(5710);
      expect(taxService.calcIsosToAvoidAmt(tax, 1000, statuses.single, stockOptionsA, 30000)).toEqual(14102);
      expect(taxService.calcIsosToAvoidAmt(tax, 1000, statuses.married, stockOptionsA, 30000)).toEqual(16748);
    });

    it('should return 0 if the base AMT tax already exceeds the given tax amount', () => {
      expect(taxService.calcIsosToAvoidAmt(tax, 150000, statuses.single, stockOptionsA, 1)).toEqual(0);
      expect(taxService.calcIsosToAvoidAmt(tax, 150000, statuses.married, stockOptionsA, 1)).toEqual(0);
    });

    it('should return Infinity if the strike price is greater than the option value', () => {
      expect(taxService.calcIsosToAvoidAmt(tax, 150000, statuses.single, stockOptionsB, 300000)).toEqual(Infinity);
      expect(taxService.calcIsosToAvoidAmt(tax, 150000, statuses.married, stockOptionsB, 300000)).toEqual(Infinity);
    });
  });
};
