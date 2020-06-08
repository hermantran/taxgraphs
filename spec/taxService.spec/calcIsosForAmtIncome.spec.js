export default (taxService) => {
  describe('calcIsosForAmtIncome()', () => {
    it('should return the correct ISO amount for a given AMT income', () => {
      expect(taxService.calcIsosForAmtIncome(54000, 50000, 1, 5)).toEqual(1000);
    });

    it('should return 0 if the strike price is greater than option value', () => {
      expect(taxService.calcIsosForAmtIncome(54000, 50000, 10, 6.6)).toEqual(0);
    });
  });
};
