
const app = require('../app');
const taxService = require('./taxService');
const taxData = require('./taxData');
const graph = require('./graph');
const screenService = require('./screenService');
const settings = require('./settings');
const tips = require('./tips');

app.service('taxService', taxService)
  .service('taxData', taxData)
  .service('graph', graph)
  .service('screenService', screenService)
  .service('settings', settings)
  .service('tips', tips);
