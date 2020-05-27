const app = require('../app');
const StateComparisonCtrl = require('./StateComparisonCtrl');
const StateBreakdownCtrl = require('./StateBreakdownCtrl');
const TakeHomePayCtrl = require('./TakeHomePayCtrl');

app
  .controller('StateComparisonCtrl', StateComparisonCtrl)
  .controller('StateBreakdownCtrl', StateBreakdownCtrl)
  .controller('TakeHomePayCtrl', TakeHomePayCtrl);
