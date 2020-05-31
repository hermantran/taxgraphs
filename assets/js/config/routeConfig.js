export default {
  stateComparison: {
    path: '/',
    templateUrl: 'assets/templates/pages/state-comparison.html',
    controller: 'StateComparisonCtrl',
    title: 'State Comparison',
  },
  stateBreakdown: {
    path: '/state-breakdown',
    templateUrl: 'assets/templates/pages/state-breakdown.html',
    controller: 'StateBreakdownCtrl',
    title: 'State Breakdown',
  },
  stateHistory: {
    path: '/state-history',
    templateUrl: 'assets/templates/pages/state-history.html',
    controller: 'StateHistoryCtrl',
    title: 'State History',
  },
  takeHomePay: {
    path: '/take-home-pay',
    templateUrl: 'assets/templates/pages/take-home-pay.html',
    controller: 'TakeHomePayCtrl',
    title: 'Take Home Pay',
  },
};

export const routeOrder = [
  'stateComparison',
  'stateBreakdown',
  'stateHistory',
  'takeHomePay',
];
