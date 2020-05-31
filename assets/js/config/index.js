import d3 from 'd3';
import lodash from 'lodash';
import gtag from 'gtag'; // eslint-disable-line import/no-unresolved
import app from '../app';
import routes from './routes';
import rootScope from './rootScope';
import project from '../../../package.json';

const domain = project.homepage;
const { version } = project;

app
  .constant('d3', d3)
  .constant('_', lodash)
  .constant('gtag', gtag)
  .constant('GA_TRACKING_ID', 'UA-55615931-1')
  .constant('TAX_API', `data/taxes.json?v=${version}`)
  .constant('TAX_YEAR', '2020')
  .constant('DOMAIN', domain)
  .constant('APP_NAME', 'taxApp')
  .constant('APP_VERSION', version)
  .config(routes)
  .run(rootScope);
