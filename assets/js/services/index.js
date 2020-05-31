import app from '../app';
import taxService from './taxService';
import taxData from './taxData';
import graph from './graph';
import screenService from './screenService';
import settings from './settings';
import tips from './tips';

app.service('taxService', taxService)
  .service('taxData', taxData)
  .service('graph', graph)
  .service('screenService', screenService)
  .service('settings', settings)
  .service('tips', tips);
