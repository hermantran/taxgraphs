import app from '../app';
import convertToNumber from './convertToNumber';
import convertToPrice from './convertToPrice';

app
  .directive('convertToNumber', convertToNumber)
  .directive('convertToPrice', convertToPrice);
