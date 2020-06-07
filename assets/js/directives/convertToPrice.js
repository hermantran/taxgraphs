import numberWithCommas from '../filters/numberWithCommas';

/* @ngInject */
export default () => ({
  require: 'ngModel',
  link(scope, element, attrs, ngModel) {
    const NON_NUMERIC_FLOAT_REGEX = /[^\d.]+/g;
    const PRICE_REGEX = /^\d+(.\d{0,2})?/;

    const formatAsPrice = (val) => {
      const priceMatch = val.replace(NON_NUMERIC_FLOAT_REGEX, '').match(PRICE_REGEX);
      return priceMatch && priceMatch[0] ? priceMatch[0] : '';
    };

    const getNumberWithCommas = numberWithCommas();

    element[0].addEventListener('input', (e) => {
      e.currentTarget.value = getNumberWithCommas(formatAsPrice(e.currentTarget.value));
    });

    ngModel.$parsers.push((val) => {
      const formattedVal = formatAsPrice(val);
      return formattedVal ? parseFloat(formattedVal, 10) : 0;
    });

    ngModel.$formatters.push((val) => {
      const isNumber = typeof val === 'number';
      return isNumber ? getNumberWithCommas(formatAsPrice(val.toString())) : '';
    });
  },
});
