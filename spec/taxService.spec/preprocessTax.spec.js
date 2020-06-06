export default (taxService) => {
  describe('preprocessTaxes()', () => {
    it('should return the same value for flat tax rates', () => {
      const flatRate = { rate: 0.5 };
      const statusFlatRate = {
        single: { rate: 0.2 },
        married: { rate: 0.1 },
      };
      expect(taxService.preprocessTaxes(flatRate)).toEqual(flatRate);
      expect(taxService.preprocessTaxes(statusFlatRate)).toEqual(statusFlatRate);
    });

    it('should return the marginal tax brackets with the total tax added except the last bracket', () => {
      expect(
        taxService.preprocessTaxes({
          rate: [
            [0, 0.1],
            [1000, 0.2],
            [10000, 0.3],
          ],
        }),
      ).toEqual({
        rate: [
          [0, 0.1, 100],
          [1000, 0.2, 1900],
          [10000, 0.3],
        ],
      });

      expect(
        taxService.preprocessTaxes({
          single: {
            rate: [
              [0, 0.1],
              [1000, 0.2],
            ],
          },
          married: {
            rate: [
              [0, 0.05],
              [1000, 0.01],
            ],
          },
        }),
      ).toEqual({
        single: {
          rate: [
            [0, 0.1, 100],
            [1000, 0.2],
          ],
        },
        married: {
          rate: [
            [0, 0.05, 50],
            [1000, 0.01],
          ],
        },
      });
    });

    it('should return an object with only changes to the `rate` properties', () => {
      expect(
        taxService.preprocessTaxes({
          '2020': {
            federal: {
              ordinaryIncome: {
                rate: {
                  single: [
                    [0, 0.1],
                    [1000, 0.2],
                  ],
                  married: [
                    [0, 0.1],
                    [2000, 0.2],
                  ],
                },
                source: {
                  name: '2020 Rates',
                  url: '//localhost',
                },
              },
              amt: {
                rate: [
                  [0, 0.2],
                  [10000, 0.3],
                ],
              },
            },
          },
        }),
      ).toEqual({
        '2020': {
          federal: {
            ordinaryIncome: {
              rate: {
                single: [
                  [0, 0.1, 100],
                  [1000, 0.2],
                ],
                married: [
                  [0, 0.1, 200],
                  [2000, 0.2],
                ],
              },
              source: {
                name: '2020 Rates',
                url: '//localhost',
              },
            },
            amt: {
              rate: [
                [0, 0.2, 2000],
                [10000, 0.3],
              ],
            },
          },
        },
      });
    });
  });
};
