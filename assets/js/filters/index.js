const app = require('../app');
const capitalize = require('./capitalize');
const percentage = require('./percentage');
const splitCamelCase = require('./splitCamelCase');

app
  .filter('capitalize', capitalize)
  .filter('percentage', percentage)
  .filter('splitCamelCase', splitCamelCase);
