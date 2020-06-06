import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => {
  describe('calcTaxCredits()', () => {
    it('should calculate the total tax credit based on the income and credit refundable status', () => {
      const credits = [
        {
          amount: [
            [0, 200],
            [10000, 100],
          ],
          isRefundable: true,
        },
        {
          amount: [
            [0, 100],
            [10000, 50],
          ],
          isRefundable: false,
        },
      ];

      expect(taxService.calcTaxCredits(credits, 10, statuses.single, 1)).toEqual(201);
      expect(taxService.calcTaxCredits(credits, 500, statuses.single, 50)).toEqual(250);
      expect(taxService.calcTaxCredits(credits, 2000, statuses.single, 200)).toEqual(300);
    });

    it('should apply non-refundable credits before refundable credits', () => {
      const credits = [
        {
          amount: [
            [0, 100],
            [20000, 50]
          ],
          isRefundable: true,
        },
        {
          amount: [
            [0, 200],
            [10000, 100]
          ],
          isRefundable: false,
        },
        {
          amount: [
            [0, 500],
            [10000, 250]
          ],
          isRefundable: false,
        },
      ];

       expect(taxService.calcTaxCredits(credits, 1000, statuses.married, 700)).toEqual(800);
       expect(taxService.calcTaxCredits(credits, 15000, statuses.married, 100)).toEqual(200);
    });
  });
};
