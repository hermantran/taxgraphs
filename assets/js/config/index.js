const d3 = require('d3');
const lodash = require('lodash');
const gtag = require('gtag'); // eslint-disable-line import/no-unresolved
const app = require('../app');
const routes = require('./routes');
const rootScope = require('./rootScope');
const project = require('../../../package.json');

const domain = project.homepage;
const { version } = project;

app
  .constant('d3', d3)
  .constant('_', lodash)
  .constant('gtag', gtag)
  .constant('GA_TRACKING_ID', 'UA-55615931-1')
  .constant('TAX_API', `data/taxes.json?v=${version}`)
  .constant('TAX_YEAR', '2017')
  .constant('DOMAIN', domain)
  .constant('APP_NAME', 'taxApp')
  .constant('APP_VERSION', version)
  .config(routes)
  .run(rootScope);
