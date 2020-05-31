import angular from '../lib/angular';

/* @ngInject */
function screenService($window) {
  const service = {};
  const resizeEvents = [];

  service.setSize = () => {
    service.width = $window.innerWidth;
    service.height = $window.innerHeight;
  };

  service.sizes = {
    sm: 568,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  service.addResizeEvent = (fn) => {
    resizeEvents.push(fn);
  };

  service.runResizeEvents = () => {
    resizeEvents.forEach((e) => e());
  };

  service.init = () => {
    service.setSize();
    service.addResizeEvent(service.setSize);
    angular.element($window).bind('resize', service.runResizeEvents);
  };

  service.init();

  return service;
}

export default screenService;
