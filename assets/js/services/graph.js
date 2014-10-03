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
    colors: this.colors.multi
  };

  function createSelector(string) {
    return '.' + string.split(' ').join('.');
  }

  function noop() {}

  this.init = function(settings) {
    var width, height;

    if (this.hasInited) {
      return;
    }
    
    this.settings = settings || this.settings;

    this.svg = d3.select('svg');

    this.parent = this.svg.select(function() { 
      return this.parentNode; 
    });

    width = parseInt(this.parent.style('width'), 10) - 10;
    height = parseInt(this.parent.style('height'), 10) - 10;

    this.m = [50, 230, 100, 100];
    this.w = width - this.m[1] - this.m[3]; 
    this.h = height - this.m[0] - this.m[2];

    this.lines = [];
    this.labelPositions = [];
    this.tooltips = [];
    this.tooltipFns = [];
    this.colorIndex = 0;

    this.lineClass = 'tax';
    this.labelClass = 'label';
    this.hoverLineClass = 'hover';
    this.hoverLabelClass = 'hoverlabel';
    this.tooltipClass = 'tooltip';
    this.circleClass = 'point';
    this.xAxisClass = 'x axis';
    this.yAxisClass = 'y axis';
    this.hideClass = 'hide';

    this.lineSelector = createSelector(this.lineClass);
    this.labelSelector = createSelector(this.labelClass);
    this.hoverLineSelector = createSelector(this.hoverLineClass);
    this.hoverLabelSelector = createSelector(this.hoverLabelClass);
    this.tooltipSelector = createSelector(this.tooltipClass);
    this.xAxisSelector = createSelector(this.xAxisClass);
    this.yAxisSelector = createSelector(this.yAxisClass);

    this.createGraph();
    this.setupEventHandlers();
    this.hasInited = true;
  };

  this.createGraph = function() {
    this.svg
      .attr('width', this.w + this.m[1] + this.m[3])
      .attr('height', this.h + this.m[0] + this.m[2]);

    this.graph = this.svg
      .append('svg:g')
      .attr('transform', 'translate(' + this.m[3] + ',' + this.m[0] + ')');

    this.updateXAxis(this.settings.xMax);
    this.updateYAxis(this.settings.yMax);
    this.drawHoverLine();
    this.drawHoverLabel();
  };

  this.setupEventHandlers = function() {
    var self = this;

    this.svg.on('mousemove', function() {
      var xPos = d3.mouse(this)[0] - self.m[3];
      self.updateHoverLine(xPos);
      self.updateHoverLabel(xPos);
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

  this.moveHoverLineToEnd = function() {
    if (this.hoverLine.attr('x1') < 0) {
      this.updateHoverLine(this.w);
    }

    this.graph.selectAll(this.labelSelector)
      .classed(this.hideClass, false);
  };

  this.updateHoverLabel = function(xPos) {
    var xChange = Math.abs(xPos - this.hoverLabel.attr('x')),
        xScale = this.xMax / this.w,
        xValue = Math.round(xPos * xScale);

    if (xChange < 0.5 || xPos > this.w) {
      return;
    }

    if (xPos < 0) {
      this.hoverLabel.classed(this.hideClass, true)
        .attr('x', -1);

    } else {
      this.hoverLabel.classed(this.hideClass, false)
        .attr('x', xPos - 35)
        .text(d3.format('$0,000')(xValue));
    }
  };

  this.updateTooltips = function(xPos) {
    var xScale = this.xMax / this.w,
        yScale = this.yMax / this.h,
        xValue = Math.round(xPos * xScale),
        prevYPos = this.h + 30,
        textYPos,
        textXPos,
        yValue,
        yPos,
        text;

    if (xPos > this.w) {
      return;
    }

    for (var i = 0, len = this.tooltips.length; i < len; i++) {
      if (xPos < 0) {
        this.tooltips[i].classed(this.hideClass, true);
      } else {
        this.tooltips[i].classed(this.hideClass, false);
      }

      textXPos = 5;
      textYPos = -5;
      if (this.w - xPos < 50) {
        textXPos = -55;
      }

      yValue = this.tooltipFns[i](xValue);

      if (!yValue) {
        yValue = 0;
      }

      yPos = this.h - (yValue / yScale * 100);
      // if (prevYPos - yPos < 15) {
      //   textYPos -= (15 - prevYPos + yPos);
      // }
      prevYPos = yPos;
      text = Math.round10(yValue * 100, -2) + '%';

      this.tooltips[i]
        .attr('transform', 'translate(' + xPos + ',' + yPos + ')')
        .select('text')
        .text(text)
        .attr('x', textXPos)
        .attr('y', textYPos);
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

  this.drawHoverLabel = function() {
    this.hoverLabel = this.graph.append('g')
      .append('text')
      .attr('x', 0)
      .attr('y', this.h + 50)
      .attr('class', this.hoverLabelClass)
      .classed(this.hideClass, true);
  };

  this.addLine = function(data, label, tooltipFn, isInterpolated) {
    this.lines.push([data, label, tooltipFn, isInterpolated]);
  };

  this.drawLines = function() {
    // Sort from lowest to highest tax rate
    this.lines.sort(function(a, b) {
      var dataA = a[0],
          yValueA = dataA[dataA.length - 1].y,
          dataB = b[0],
          yValueB = dataB[dataB.length - 1].y;

      return yValueA - yValueB;
    });

    for (var i = 0, len = this.lines.length; i < len; i++) {
      this.drawLine.apply(this, this.lines[i]);
    }
  };
        
  this.drawLine = function(data, label, tooltipFn, isInterpolated) {
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

    this.drawTooltip(tooltipFn);
    this.drawLabel(data, label);
  };

  this.animatePath = function(path) {
    var length = path.node().getTotalLength();

    path.attr('stroke-dasharray', length + ' ' + length)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(this.settings.animationTime)
      .ease('linear')
      .attr('stroke-dashoffset', 0)
      .each('end', this.moveHoverLineToEnd.bind(this));
  };

  this.drawTooltip = function(tooltipFn) {
    // http://bl.ocks.org/mbostock/3902569
    var tooltip = this.graph.append('g')
      .attr('class', this.tooltipClass)
      .classed(this.hideClass, true);

    tooltip.append('circle')
      .attr('class', this.circleClass)
      .attr('fill', this.settings.colors[this.colorIndex])
      .attr('r', 4);

    tooltip.append('text')
      .attr('x', 5)
      .attr('y', -5);

    this.tooltips.push(tooltip);
    this.colorIndex = (this.colorIndex + 1) % this.settings.colors.length;

    if (tooltipFn) {
      this.tooltipFns.push(tooltipFn);
    } else {
      this.tooltipFns.push(noop);
    }
  };

  this.drawLabel = function(data, text) {
    var lastPoint = data[data.length - 1],
        yScale = 100 * this.h / this.yMax,
        yPos = this.h - (lastPoint.y * yScale),
        len = this.labelPositions.length,
        lastLabelPosition = this.labelPositions[len - 1] || this.h + 30;

    if (lastLabelPosition - yPos < 15) {
      yPos -= (15 - lastLabelPosition + yPos);
    }

    var label = this.graph.append('g')
      .attr('transform', 'translate(' + this.w + ',' + yPos + ')')
      .attr('class', this.labelClass)
      .classed(this.hideClass, true);
      
    label.append('text')
      .attr('x', 10)
      .attr('y', -5)
      .text(text);

    this.labelPositions.push(yPos);
  };

  this.resetTooltips = function() {
    this.updateHoverLine(-1);
    this.labelPositions.length = 0;
    this.tooltips.length = 0;
    this.tooltipFns.length = 0;
    this.colorIndex = 0;
    this.graph.selectAll(this.labelSelector).remove();
  };

  this.clear = function() {
    this.resetTooltips();
    this.lines.length = 0;
    this.graph.selectAll(this.lineSelector).transition().duration(0);
    this.graph.selectAll(this.tooltipSelector).remove();
    this.graph.selectAll(this.lineSelector).remove();
  };
};