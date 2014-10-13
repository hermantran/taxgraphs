'use strict';

module.exports = function($window) {
  this.setSize = function() {
    this.width = $window.innerWidth;
    this.height = $window.innerHeight;
    console.log(this.width, this.height);
  }.bind(this);
  
  this.sizes = {
    sm: 568,
    md: 768,
    lg: 1024,
    xl: 1280 
  };

  this.setSize();
  angular.element($window).bind('resize', this.setSize);
};