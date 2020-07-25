import app from '../app';
import StateComparisonCtrl from './StateComparisonCtrl';
import StateBreakdownCtrl from './StateBreakdownCtrl';
import StateHistoryCtrl from './StateHistoryCtrl';
import CaliforniaIsoAmtCtrl from './CaliforniaIsoAmtCtrl';
import FederalIsoAmtCtrl from './FederalIsoAmtCtrl';
import TakeHomePayCtrl from './TakeHomePayCtrl';

app
  .controller('StateComparisonCtrl', StateComparisonCtrl)
  .controller('StateBreakdownCtrl', StateBreakdownCtrl)
  .controller('StateHistoryCtrl', StateHistoryCtrl)
  .controller('CaliforniaIsoAmtCtrl', CaliforniaIsoAmtCtrl)
  .controller('FederalIsoAmtCtrl', FederalIsoAmtCtrl)
  .controller('TakeHomePayCtrl', TakeHomePayCtrl);
