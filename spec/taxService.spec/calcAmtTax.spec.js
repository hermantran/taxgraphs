import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => {
  describe('calcAmtTax()', () => {
    it('should return the correct tax amount', () => {
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
      expect(taxService.calcAmtTax(tax, 100000, statuses.single, 1, 5, 5000)).toEqual(12558);
      expect(taxService.calcAmtTax(tax, 500000, statuses.single, 1, 5, 5000)).toEqual(121628);
      expect(taxService.calcAmtTax(tax, 100000, statuses.married, 1, 5, 5000)).toEqual(2158);
      expect(taxService.calcAmtTax(tax, 500000, statuses.married, 1, 5, 5000)).toEqual(110428);
    });

    it('should throw an error if the tax rate is of the wrong type', () => {
      expect(() => {
        taxService.calcAmtTax(0.25, 10000, statuses.single, 1, 5, 5000);
      }).toThrow();
    });
  });
};
