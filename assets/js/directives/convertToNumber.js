/* @ngInject */
export default () => ({
  require: 'ngModel',
  link(scope, element, attrs, ngModel) {
    ngModel.$parsers.push((val) => parseInt(val, 10));
    ngModel.$formatters.push((val) => `${val}`);
  },
});
