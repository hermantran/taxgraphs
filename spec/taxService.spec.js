'use strict';

var _ = require('lodash'),
    TaxService = require('../assets/js/services/taxService'),
    taxService = new TaxService(_),
    specHelper = require('./specHelper');
    
describe('taxService', function() {
  describe('preprocessTaxes()', function() {
    it('doesn\'t modify flat tax rates', function() {
      var flatRate = { rate: 0.5 };
      var statusFlatRate = { 
        single: { rate: 0.2 }, 
        married: { rate: 0.1 }
      };
      expect(taxService.preprocessTaxes(flatRate)).toEqual(flatRate);
      expect(taxService.preprocessTaxes(statusFlatRate)).toEqual(statusFlatRate);
    });

    it('adds the total tax to each marginal tax bracket except the last bracket', function() {
      expect(taxService.preprocessTaxes({ rate: [[0, 0.1], [1000, 0.2]] }))
        .toEqual({ rate: [[0, 0.1, 100], [1000, 0.2]] });

      expect(taxService.preprocessTaxes({ 
        single: { rate: [[0, 0.1], [1000, 0.2]] },
        married: { rate: [[0, 0.05], [1000, 0.01]] }
      })).toEqual({ 
        single: { rate: [[0, 0.1, 100], [1000, 0.2]] },
        married: { rate: [[0, 0.05, 50], [1000, 0.01]] }
      });
    });
  });
});