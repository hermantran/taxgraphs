import app from '../app';
import StateComparisonCtrl from './StateComparisonCtrl';
import StateBreakdownCtrl from './StateBreakdownCtrl';
import TakeHomePayCtrl from './TakeHomePayCtrl';

app
  .controller('StateComparisonCtrl', StateComparisonCtrl)
  .controller('StateBreakdownCtrl', StateBreakdownCtrl)
  .controller('TakeHomePayCtrl', TakeHomePayCtrl);
