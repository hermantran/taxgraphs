import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => {
  describe('modifyRetirementSaversCredit()', () => {
    it('should modify the credit maxmium correctly based on the contribution', () => {
      const credit = {
        rate: [
          [0, 0.3],
          [1001, 0.2],
          [2001, 0.1],
          [3001, 0],
        ],
        maximum: 250,
        isRefundable: false,
      };
      expect(taxService.modifyRetirementSaversCredit(credit, statuses.single, 1000)).toEqual({
        amount: [
          [0, 250],
          [1001, 200],
          [2001, 100],
          [3001, 0],
        ],
        rate: [
          [0, 0.3],
          [1001, 0.2],
          [2001, 0.1],
          [3001, 0],
        ],
        maximum: 250,
        isRefundable: false,
      });
    });
  });
};
