export default (taxService) => {
  describe('calcAmtIncome()', () => {
    it('should return the correct AMT income based on ISOs', () => {
      expect(taxService.calcAmtIncome(50000, 1, 5, 1000)).toEqual(54000);
    });

    it('should return the base AMT income if strike price is greater than option value', () => {
      expect(taxService.calcAmtIncome(50000, 10, 6.6, 1000)).toEqual(50000);
    });
  });
};
