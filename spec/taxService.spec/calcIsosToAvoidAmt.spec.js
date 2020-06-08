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

    it('should return the correct amount of ISOs to avoid AMT', () => {
      expect(taxService.calcIsosToAvoidAmt(tax, 150000, statuses.single, 2.5, 16, 30000)).toEqual(2748);
      expect(taxService.calcIsosToAvoidAmt(tax, 150000, statuses.married, 2.5, 16, 30000)).toEqual(5710);
    });

    it('should return 0 if the base AMT tax already exceeds the given tax amount', () => {
      expect(taxService.calcIsosToAvoidAmt(tax, 150000, statuses.single, 2.5, 16, 1)).toEqual(0);
    });
  });
};
