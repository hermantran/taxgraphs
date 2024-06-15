import d3 from 'd3';
import gtag from 'gtag'; // eslint-disable-line import/no-unresolved
import app from '../app';
import routeConfig, { routeOrder } from './routeConfig';
import routes from './routes';
import rootScope from './rootScope';
import { version, homepage } from '../../../package.json';

app
  .constant('d3', d3)
  .constant('gtag', gtag)
  .constant('GA_TRACKING_ID', 'UA-55615931-1')
  .constant('TAX_API', `data/taxes.json?v=${version}`)
  .constant('TAX_YEAR', '2024')
  .constant('DOMAIN', homepage)
  .constant('APP_NAME', 'taxApp')
  .constant('APP_VERSION', version)
  .constant('ROUTE_CONFIG', routeConfig)
  .constant('ROUTE_ORDER', routeOrder)
  .config(routes)
  .run(rootScope);
