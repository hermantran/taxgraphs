import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => {
  describe('createDeductionsData()', () => {
    it('should combine all deductions into one bracket', () => {
      const deductions = [
        {
          amount: [
            [0, 4000],
            [5000, 2000],
            [12000, 0],
          ],
        },
        {
          amount: [
            [0, 1000],
            [3000, 500],
            [6000, 250],
          ],
        },
        {
          amount: [
            [0, 500],
            [5000, 300],
            [10000, 100],
          ],
        },
        { amount: 1000 },
      ];

      expect(taxService.createDeductionsData(deductions, statuses.single)).toEqual([
        [0, 6500],
        [3000, 6000],
        [5000, 3800],
        [6000, 3550],
        [10000, 3350],
        [12000, 1350],
      ]);
    });
  });
};
