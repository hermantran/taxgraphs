'use strict';

module.exports = function(localStorageService) {
  var list;

  this.key = 'taxAppTips';

  if (!localStorageService.get(this.key)) {
    list = [
      {
        closed: false,
        text: 'Hover over or click on the graph to view tax rates ' +
          'at a specific income.'
      }
    ];
    localStorageService.set(this.key, list);
  }

  this.list = localStorageService.get(this.key);

  this.close = function(index) {
    index = parseInt(index, 10);
    this.list[index].closed = true;
    localStorageService.set(this.key, this.list);
  }.bind(this);
};