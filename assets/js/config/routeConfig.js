export default {
  stateComparison: {
    path: '/',
    templateUrl: 'assets/templates/pages/state-comparison.html',
    controller: 'StateComparisonCtrl',
    title: 'State Comparison',
    description: 'Compares overall income tax rates between states',
  },
  stateBreakdown: {
    path: '/state-breakdown',
    templateUrl: 'assets/templates/pages/state-breakdown.html',
    controller: 'StateBreakdownCtrl',
    title: 'State Breakdown',
    description:
      "Breaks down the individual tax rates of a state's overall income tax rate",
  },
  stateHistory: {
    path: '/state-history',
    templateUrl: 'assets/templates/pages/state-history.html',
    controller: 'StateHistoryCtrl',
    title: 'State History',
    description: "Compares a state's overall income tax rates between years",
  },
  takeHomePay: {
    path: '/take-home-pay',
    templateUrl: 'assets/templates/pages/take-home-pay.html',
    controller: 'TakeHomePayCtrl',
    title: 'Take Home Pay',
    description: 'Compares take home pay between different filing statuses',
  },
  federalIsoAmt: {
    path: '/amt',
    templateUrl: 'assets/templates/pages/stock-option-amt.html',
    controller: 'FederalIsoAmtCtrl',
    title: 'Federal ISO AMT',
    description:
      'Calculates federal alternative minimum tax for exercising incentive stock options',
  },
  californiaIsoAmt: {
    path: '/ca-amt',
    templateUrl: 'assets/templates/pages/stock-option-amt.html',
    controller: 'CaliforniaIsoAmtCtrl',
    title: 'California ISO AMT',
    description:
      'Calculates California state alternative minimum tax for exercising incentive stock options',
  },
  disclaimer: {
    path: '/disclaimer',
    title: 'Disclaimer',
  },
};

export const routeOrder = [
  'stateComparison',
  'stateBreakdown',
  'stateHistory',
  'takeHomePay',
  'federalIsoAmt',
  'californiaIsoAmt',
];
