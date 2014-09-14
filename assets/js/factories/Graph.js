'use strict';

module.exports = function(d3) {
  function Graph() {
    this.xMin = 0;
    this.xMax = 150000;
    this.m = [50, 50, 50, 50]; // margins
    this.w = 1000 - this.m[1] - this.m[3]; // width
    this.h = 800 - this.m[0] - this.m[2]; // height
  }

  Graph.prototype.init = function() {
    this.graph = d3.select('svg')
      .attr('width', this.w + this.m[1] + this.m[3])
      .attr('height', this.h + this.m[0] + this.m[2])
      .append('svg:g')
      .attr('transform', 'translate(' + this.m[3] + ',' + this.m[0] + ')');

    this.x = d3.scale.linear()
      .domain([this.xMin, this.xMax])
      .range([0, this.w]);

    this.y = d3.scale.linear()
      .domain([0, 0.5])
      .range([this.h, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .tickSize(-this.h, 0)
      .tickFormat(d3.format('$0,000'))
      .tickPadding(7)
      .orient('bottom');

    this.graph.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.h + ')')
      .call(this.xAxis);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .ticks(4)
      .tickSize(-this.w, 0)
      .tickFormat(d3.format('%'))
      .tickPadding(7)
      .orient('left');

    this.graph.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(0,0)')
      .call(this.yAxis)
      .selectAll('.tick')
        .filter(function (d) { return d === 0; })
        .remove();
  };
        
  Graph.prototype.drawLine = function(data) {
    var line = d3.svg.line()
      .x(function(d) { return this.x(d.x); })
      .y(function(d) { return this.y(d.y); });

    this.graph.append('svg:path')
      .attr('d', line(data));
  };

  return Graph;
};