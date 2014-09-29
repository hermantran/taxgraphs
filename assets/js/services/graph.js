'use strict';

module.exports = function(d3) {
  this.hasInited = false;

  this.colors = {
    blue: [
      'steelblue'
    ],
    multi: [
      '#654B6B',
      '#6EAE41',
      '#C950CA',
      '#BE4C3B',
      '#4CA086',
      '#55612C',
      '#C28D39',
      '#C65583',
      '#7597C2',
      '#856EC7'
    ]
  };

  this.settings = {
    xMin: 0,
    xMax: 250000,
    yMin: 0,
    yMax: 50,
    animationTime: 2500,
    width: 1000,
    height: 600,
    colors: this.colors.multi
  };

  function createSelector(string) {
    return '.' + string.split(' ').join('.');
  }

  function noop() {}

  this.init = function(settings) {
    if (this.hasInited) {
      return;
    }
    
    this.settings = settings || this.settings;

    this.m = [50, 70, 50, 70];
    this.w = this.settings.width - this.m[1] - this.m[3]; 
    this.h = this.settings.height - this.m[0] - this.m[2];

    this.tooltips = [];
    this.tooltipFns = [];
    this.colorIndex = 0;

    this.lineClass = 'tax';
    this.hoverLineClass = 'hover';
    this.tooltipClass = 'tooltip';
    this.circleClass = 'point';
    this.xAxisClass = 'x axis';
    this.yAxisClass = 'y axis';
    this.hideClass = 'hide';

    this.lineSelector = createSelector(this.lineClass);
    this.hoverLineSelector = createSelector(this.hoverLineClass);
    this.tooltipSelector = createSelector(this.tooltipClass);
    this.xAxisSelector = createSelector(this.xAxisClass);
    this.yAxisSelector = createSelector(this.yAxisClass);

    this.createGraph();
    this.setupEventHandlers();
    this.hasInited = true;
  };

  this.createGraph = function() {
    this.svg = d3.select('svg')
      .attr('width', this.w + this.m[1] + this.m[3])
      .attr('height', this.h + this.m[0] + this.m[2]);

    this.graph = this.svg
      .append('svg:g')
      .attr('transform', 'translate(' + this.m[3] + ',' + this.m[0] + ')');

    this.updateXAxis(this.settings.xMax);
    this.updateYAxis(this.settings.yMax);
    this.drawHoverLine();
  };

  this.setupEventHandlers = function() {
    var self = this;

    this.svg.on('mousemove', function() {
      var xPos = d3.mouse(this)[0] - self.m[3];
      self.updateHoverLine(xPos);
    });
  };

  this.updateHoverLine = function(xPos) {
    var xChange = Math.abs(xPos - this.hoverLine.attr('x1'));
    if (xChange < 0.5 || xPos > this.w) {
      return;
    }

    if (xPos < 0) {
      this.hoverLine.classed(this.hideClass, true)
        .attr('x1', -1).attr('x2', -1);
    } else {
      this.hoverLine.classed(this.hideClass, false)
        .attr('x1', xPos).attr('x2', xPos);
    }

    this.updateTooltips(xPos);
  };

  this.updateTooltips = function(xPos) {
    var xScale = this.xMax / this.w,
        yScale = this.yMax / this.h,
        xValue = Math.round(xPos * xScale),
        prevYPos = 0,
        yValue,
        yPos,
        text;

    if (xPos > this.w) {
      return;
    }

    for (var i = 0, len = this.tooltips.length; i < len; i++) {
      if (xPos < 0) {
        this.tooltips[i].classed(this.hideClass, true);
      }  else {
        this.tooltips[i].classed(this.hideClass, false);
      }

      yValue = this.tooltipFns[i](xValue);

      if (!yValue) {
        yValue = 0;
      }

      yPos = this.h - (yValue / yScale * 100);

      // Prevent text collision for two lines that are too close
      // if (Math.abs(yPos - prevYPos) < 20) {
      //   console.log(yPos, prevYPos);
      //   yPos -= 20;
      // }

      prevYPos = yPos;
      text = Math.round10(yValue * 100, -2) + '%';

      this.tooltips[i]
        .attr('transform', 'translate(' + xPos + ',' + yPos + ')')
        .select('text')
        .text(text);
    }
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

  this.drawHoverLine = function() {
    // http://bl.ocks.org/benjchristensen/2657838
    this.hoverLine = this.graph.append('svg:line')
      .attr('x1', 0).attr('x2', 0)
      .attr('y1', 0).attr('y2', this.h)
      .attr('class', this.hoverLineClass)
      .classed(this.hideClass, true);
  };
        
  this.drawLine = function(data, tooltipFn, isInterpolated) {
    var line = d3.svg.line()
      .x(function(d) { return this.x(d.x); }.bind(this))
      .y(function(d) { return this.y(d.y); }.bind(this));

    if (isInterpolated) {
      line.interpolate('basis');
    }

    var path = this.graph.append('svg:path')
      .attr('class', this.lineClass)
      .attr('stroke', this.settings.colors[this.colorIndex])
      .attr('d', line(data));

    if (this.settings.animationTime > 100) {
      this.animatePath(path);
    }

    this.drawPoint();
    this.colorIndex = (this.colorIndex + 1) % this.settings.colors.length;

    if (tooltipFn) {
      this.tooltipFns.push(tooltipFn);
    } else {
      this.tooltipFns.push(noop);
    }
  };

  this.animatePath = function(path) {
    var length = path.node().getTotalLength();

    path.attr('stroke-dasharray', length + ' ' + length)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(this.settings.animationTime)
      .ease('linear')
      .attr('stroke-dashoffset', 0)
      .each('end', this.updateHoverLine.bind(this, this.w));
  };

  this.drawPoint = function() {
    // http://bl.ocks.org/mbostock/3902569
    var tooltip = this.graph.append('g')
      .attr('class', this.tooltipClass)
      .classed(this.hideClass, true);

    tooltip.append('circle')
      .attr('class', this.circleClass)
      .attr('fill', this.settings.colors[this.colorIndex])
      .attr('r', 3);

    tooltip.append('text')
      .attr('x', 5)
      .attr('y', -5);

    this.tooltips.push(tooltip);
  };

  this.resetTooltips = function() {
    this.updateHoverLine(-1);
    this.tooltips.length = 0;
    this.tooltipFns.length = 0;
    this.colorIndex = 0;
  };

  this.clear = function() {
    this.resetTooltips();
    this.graph.selectAll(this.tooltipSelector).remove();
    this.graph.selectAll(this.lineSelector).remove();
  };
};