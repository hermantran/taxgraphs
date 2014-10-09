'use strict';

module.exports = function($window) {
  this.width = $window.innerWidth;
  this.height = $window.innerHeight;

  this.sizes = {
    sm: 568,
    md: 768,
    lg: 1024,
    xl: 1280 
  };

  $window.onresize = function() {
    this.width = $window.innerWidth;
    this.height = $window.innerHeight;
  }.bind(this);
};