'use strict';

/* @ngInject */
function screenService($window) {
  var service = {},
      resizeEvents = [];

  service.setSize = function() {
    service.width = $window.innerWidth;
    service.height = $window.innerHeight;
  };
  
  service.sizes = {
    sm: 568,
    md: 768,
    lg: 1024,
    xl: 1280 
  };

  service.addResizeEvent = function(fn) {
    resizeEvents.push(fn);
  };

  service.runResizeEvents = function() {
    for (var i = 0, len = resizeEvents.length; i < len; i++) {
      resizeEvents[i]();
    }
  };

  service.init = function() {
    service.setSize();
    service.addResizeEvent(service.setSize);
    angular.element($window).bind('resize', service.runResizeEvents);
  };

  service.init();

  return service;
}

module.exports = screenService;