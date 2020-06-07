import numberWithCommas from '../filters/numberWithCommas';

/* @ngInject */
export default () => ({
  require: 'ngModel',
  link(scope, element, attrs, ngModel) {
    const NON_NUMERIC_REGEX = /[^\d]+/g;

    const formatAsNumber = (val) => val.replace(NON_NUMERIC_REGEX, '');
    const getNumberWithCommas = numberWithCommas();

    element[0].addEventListener('input', (e) => {
      e.currentTarget.value = getNumberWithCommas(formatAsNumber(e.currentTarget.value));
    });

    ngModel.$parsers.push((val) => {
      const formattedVal = formatAsNumber(val);
      return formattedVal ? parseInt(formattedVal, 10) : 0;
    });

    ngModel.$formatters.push((val) => {
      const isNumber = typeof val === 'number';
      return isNumber ? getNumberWithCommas(formatAsNumber(val.toString())) : '';
    });
  },
});
