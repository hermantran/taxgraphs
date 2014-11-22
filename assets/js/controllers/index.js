'use strict';

var app = require('../app'),
    StateComparisonCtrl = require('./StateComparisonCtrl'),
    StateBreakdownCtrl = require('./StateBreakdownCtrl'),
    TakeHomePayCtrl = require('./TakeHomePayCtrl');

app.controller('StateComparisonCtrl', StateComparisonCtrl)
.controller('StateBreakdownCtrl', StateBreakdownCtrl)
.controller('TakeHomePayCtrl', TakeHomePayCtrl);