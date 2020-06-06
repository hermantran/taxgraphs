import { filingStatuses as statuses } from '../specHelper';

export default (taxService) => {
  describe('modifyDependentsDeduction()', () => {
    it('should modify a flat dependents deduction correctly', () => {
      const deduction = { amount: { single: 400, married: 800 } };
      expect(taxService.modifyDependentsDeduction(deduction, statuses.married, 3)).toEqual({
        amount: 2400,
      });
    });

    it('should modify a dependents deduction with simple phaseouts correctly', () => {
      const deduction = {
        amount: [
          [0, 4000],
          [5000, 2000],
          [10000, 1000],
        ],
      };
      expect(taxService.modifyDependentsDeduction(deduction, statuses.married, 2)).toEqual({
        amount: [
          [0, 8000],
          [5000, 4000],
          [10000, 2000],
        ],
      });
    });
  });
};
