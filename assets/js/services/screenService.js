'use strict';

module.exports = function($window) {
  var resizeEvents = [];

  this.setSize = function() {
    this.width = $window.innerWidth;
    this.height = $window.innerHeight;
  }.bind(this);
  
  this.sizes = {
    sm: 568,
    md: 768,
    lg: 1024,
    xl: 1280 
  };

  this.addResizeEvent = function(fn) {
    resizeEvents.push(fn);
  };

  this.runResizeEvents = function() {
    for (var i = 0, len = resizeEvents.length; i < len; i++) {
      resizeEvents[i]();
    }
  };

  this.setSize();
  this.addResizeEvent(this.setSize.bind(this));
  angular.element($window).bind('resize', this.runResizeEvents.bind(this));
};