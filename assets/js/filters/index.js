import app from '../app';
import capitalize from './capitalize';
import percentage from './percentage';
import splitCamelCase from './splitCamelCase';

app
  .filter('capitalize', capitalize)
  .filter('percentage', percentage)
  .filter('splitCamelCase', splitCamelCase);
