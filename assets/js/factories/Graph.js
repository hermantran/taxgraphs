'use strict';

module.exports = function(d3) {
  function Graph(opts) {
    opts = opts || {};

    this.xMin = opts.xMin || 0;
    this.xMax = opts.xMax || 150000;
    this.m = [50, 50, 50, 50]; // margins
    this.width = opts.width || 1000;
    this.height = opts.height || 600;
    this.w = this.width - this.m[1] - this.m[3]; // width
    this.h = this.height - this.m[0] - this.m[2]; // height
    this.lineClass = 'tax';
    this.xAxisClass = 'x axis';
    this.yAxisClass = 'y axis';
  }

  Graph.prototype.updateXAxis = function(xMax) {
    this.xMax = xMax;

    this.x = d3.scale.linear()
      .domain([this.xMin, this.xMax])
      .range([0, this.w]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(6)
      .tickSize(-this.h, 0)
      .tickFormat(d3.format('$0,000'))
      .tickPadding(10)
      .orient('bottom');

    this.graph.selectAll('.' + this.xAxisClass.split(' ').join('.')).remove();

    this.graph.append('svg:g')
      .attr('class', this.xAxisClass)
      .attr('transform', 'translate(0,' + this.h + ')')
      .call(this.xAxis);
  };

  Graph.prototype.init = function() {
    this.graph = d3.select('svg')
      .attr('width', this.w + this.m[1] + this.m[3])
      .attr('height', this.h + this.m[0] + this.m[2])
      .append('svg:g')
      .attr('transform', 'translate(' + this.m[3] + ',' + this.m[0] + ')');

    this.updateXAxis(this.xMax);

    this.y = d3.scale.linear()
      .domain([0, 0.65])
      .range([this.h, 0]);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .ticks(4)
      .tickSize(-this.w, 0)
      .tickFormat(d3.format('%'))
      .tickPadding(7)
      .orient('left');

    this.graph.append('svg:g')
      .attr('class', this.yAxisClass)
      .attr('transform', 'translate(0,0)')
      .call(this.yAxis)
      .selectAll('.tick')
        .filter(function (d) { return d === 0; })
        .remove();
  };
        
  Graph.prototype.drawLine = function(data, isInterpolated) {
    var line = d3.svg.line()
      .x(function(d) { return this.x(d.x); }.bind(this))
      .y(function(d) { return this.y(d.y); }.bind(this));

    if (isInterpolated) {
      line.interpolate('basis');
    }

    var path = this.graph.append('svg:path')
      .attr('class', this.lineClass)
      .attr('d', line(data));

    var length = path.node().getTotalLength();

    path
      .attr('stroke-dasharray', length + ' ' + length)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(1500)
      .ease('linear')
      .attr('stroke-dashoffset', 0);
  };

  Graph.prototype.removeLines = function() {
    this.graph.selectAll('.' + this.lineClass).remove();
  };

  return Graph;
};