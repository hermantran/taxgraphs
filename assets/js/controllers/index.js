import app from '../app';
import StateComparisonCtrl from './StateComparisonCtrl';
import StateBreakdownCtrl from './StateBreakdownCtrl';
import StateHistoryCtrl from './StateHistoryCtrl';
import TakeHomePayCtrl from './TakeHomePayCtrl';

app
  .controller('StateComparisonCtrl', StateComparisonCtrl)
  .controller('StateBreakdownCtrl', StateBreakdownCtrl)
  .controller('StateHistoryCtrl', StateHistoryCtrl)
  .controller('TakeHomePayCtrl', TakeHomePayCtrl);
