'use strict';

module.exports = function(d3) {
  this.hasInited = false;

  this.settings = {
    xMin: 0,
    xMax: 250000,
    yMin: 0,
    yMax: 50,
    animationTime: 2500,
    width: 1000,
    height: 600
  };

  this.init = function(settings) {
    if (this.hasInited) {
      return;
    }
    
    this.settings = settings || this.settings;

    this.m = [50, 50, 50, 50];
    this.w = this.settings.width - this.m[1] - this.m[3]; 
    this.h = this.settings.height - this.m[0] - this.m[2];

    this.lineClass = 'tax';
    this.xAxisClass = 'x axis';
    this.yAxisClass = 'y axis';

    this.lineSelector = createSelector(this.lineClass);
    this.xAxisSelector = createSelector(this.xAxisClass);
    this.yAxisSelector = createSelector(this.yAxisClass);

    this.createGraph();
    this.setupEventHandlers();
    this.hasInited = true;
  };

  function createSelector(string) {
    return '.' + string.split(' ').join('.');
  }

  this.createGraph = function() {
    this.svg = d3.select('svg')
      .attr('width', this.w + this.m[1] + this.m[3])
      .attr('height', this.h + this.m[0] + this.m[2]);

    this.graph = this.svg
      .append('svg:g')
      .attr('transform', 'translate(' + this.m[3] + ',' + this.m[0] + ')');

    this.updateXAxis(this.settings.xMax);
    this.updateYAxis(this.settings.yMax);
  };

  this.setupEventHandlers = function() {
    var self = this;

    this.svg.on('mousemove', function() {
      var xPixel = d3.mouse(this)[0];
      self.processXPixel(xPixel);
    });
  };

  this.processXPixel = function(xPixel) {
    var xScale = this.xMax / this.w,
        xValue = Math.round((xPixel - this.m[3]) * xScale);

    console.log(xValue);
  };

  this.updateXAxis = function(xMax) {
    if (this.xMax === xMax) {
      return;
    }

    this.xMax = xMax;

    this.x = d3.scale.linear()
      .domain([this.settings.xMin, this.xMax])
      .range([0, this.w]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(6)
      .tickSize(-this.h, 0)
      .tickFormat(d3.format('$0,000'))
      .tickPadding(10)
      .orient('bottom');

    this.graph.selectAll(this.xAxisSelector).remove();

    this.graph.append('svg:g')
      .attr('class', this.xAxisClass)
      .attr('transform', 'translate(0,' + this.h + ')')
      .call(this.xAxis);
  };

  this.updateYAxis = function(yMax) {
    if (this.yMax === yMax) {
      return;
    }

    this.yMax = yMax;

    this.y = d3.scale.linear()
      .domain([this.settings.yMin / 100, this.yMax / 100])
      .range([this.h, 0]);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .ticks(4)
      .tickSize(-this.w, 0)
      .tickFormat(d3.format('%'))
      .tickPadding(7)
      .orient('left');

    this.graph.selectAll(this.yAxisSelector).remove();

    this.graph.append('svg:g')
      .attr('class', this.yAxisClass)
      .attr('transform', 'translate(0,0)')
      .call(this.yAxis)
      .selectAll('.tick')
        .filter(function (d) { return d === 0; })
        .remove();
  };

  this.updateAnimationTime = function(time) {
    this.settings.animationTime = time;
  };

  this.update = function(settings) {
    if (settings.xMax) {
      this.updateXAxis(settings.xMax);
    }

    if (settings.yMax) {
      this.updateYAxis(settings.yMax);
    }

    if (settings.animationTime) {
      this.updateAnimationTime(settings.animationTime);
    }
  };
        
  this.drawLine = function(data, isInterpolated) {
    var line = d3.svg.line()
      .x(function(d) { return this.x(d.x); }.bind(this))
      .y(function(d) { return this.y(d.y); }.bind(this));

    if (isInterpolated) {
      line.interpolate('basis');
    }

    var path = this.graph.append('svg:path')
      .attr('class', this.lineClass)
      .attr('d', line(data));

    if (this.settings.animationTime > 100) {
      this.animatePath(path);
    }
  };

  this.animatePath = function(path) {
    var length = path.node().getTotalLength();

    path.attr('stroke-dasharray', length + ' ' + length)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(this.settings.animationTime)
      .ease('linear')
      .attr('stroke-dashoffset', 0);
  };

  this.clear = function() {
    this.graph.selectAll(this.lineSelector).remove();
  };
};