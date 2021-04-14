export default (taxService) => {
  describe('calcIsosForAmtIncome()', () => {
    it('should return the correct ISO amount for a given AMT income', () => {
      const stockOptionsA = [
        {
          strikePrice: 1,
          optionValue: 5,
          isoAmount: 3000,
        }
      ];
      const stockOptionsB = [
        {
          strikePrice: 1,
          optionValue: 5,
          isoAmount: 500,
        },
        {
          strikePrice: 1,
          optionValue: 5,
          isoAmount: 1500,
        }
      ];
      expect(taxService.calcIsosForAmtIncome(54000, 50000, stockOptionsA)).toEqual(1000);
      expect(taxService.calcIsosForAmtIncome(54000, 50000, stockOptionsB)).toEqual(1000);
    });

    it('should return 0 if the strike price is greater than option value', () => {
      const stockOptions = [
        {
          strikePrice: 10,
          optionValue: 6.6,
          isoAmount: 3000,
        }
      ];
      expect(taxService.calcIsosForAmtIncome(54000, 50000, stockOptions)).toEqual(0);
    });
  });
};
