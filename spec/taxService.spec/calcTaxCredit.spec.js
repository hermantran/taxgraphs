export default (taxService) => {
	describe('calcTaxCredit()', () => {
    it('should calculate the correct tax credit based on the income', () => {
      const credit = {
        amount: [
          [0, 100],
          [10000, 50],
          [20000, 0],
        ],
      };

      expect(taxService.calcTaxCredit(credit, 9999)).toEqual(100);
      expect(taxService.calcTaxCredit(credit, 10000)).toEqual(50);
      expect(taxService.calcTaxCredit(credit, 20001)).toEqual(0);
    });

    it('should throw an error if the tax credit is not an array of credit amounts per income level', () => {
      expect(() => {
        taxService.calcTaxCredit({}, 10000);
      }).toThrow();
    });
  });
};
