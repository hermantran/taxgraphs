'use strict';

module.exports = function(d3) {
  function createSelector(string) {
    return '.' + string.split(' ').join('.');
  }

  function noop() {}

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

  this.classes = {
    line: 'tax',
    label: 'label',
    hoverLine: 'hover',
    hoverLabel: 'hoverlabel',
    tooltip: 'tooltip',
    circle: 'point',
    xAxis: 'x axis',
    yAxis: 'y axis',
    hide: 'hide'
  };

  this.selectors = {};

  for (var prop in this.classes) {
    this.selectors[prop] = createSelector(this.classes[prop]);
  }

  this.settings = {
    xMin: 0,
    xMax: 250000,
    yMin: 0,
    yMax: 50,
    animationTime: 2500,
    colors: this.colors.multi
  };

  this.init = function(settings) {
    var parent, width, height;

    if (this.hasInited) {
      return;
    }
    
    this.settings = settings || this.settings;

    this.svg = d3.select('svg');

    parent = this.svg.select(function() { 
      return this.parentNode; 
    });

    width = parseInt(parent.style('width'), 10) - 10;
    height = parseInt(parent.style('height'), 10) - 10;

    if (width <= 768) {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    this.m = [80, 230, 80, 100];
    this.w = width - this.m[1] - this.m[3]; 
    this.h = height - this.m[0] - this.m[2];

    this.lines = [];
    this.labelPositions = [];
    this.tooltips = [];
    this.tooltipFns = [];
    this.colorIndex = 0;

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
      this.hoverLine.classed(this.classes.hide, true)
        .attr('x1', -1).attr('x2', -1);
    } else {
      this.hoverLine.classed(this.classes.hide, false)
        .attr('x1', xPos).attr('x2', xPos);
    }

    this.updateTooltips(xPos);
  };

  this.moveHoverLineToEnd = function() {
    if (this.hoverLine.attr('x1') < 0) {
      this.updateHoverLine(this.w);
    }

    this.graph.selectAll(this.selectors.label)
      .classed(this.classes.hide, false);
  };

  this.updateHoverLabel = function(xPos) {
    var xChange = Math.abs(xPos - this.hoverLabel.attr('x')),
        xScale = this.xMax / this.w,
        xValue = Math.round(xPos * xScale);

    if (xChange < 0.5 || xPos > this.w) {
      return;
    }

    if (xPos < 0) {
      this.hoverLabel.classed(this.classes.hide, true)
        .attr('x', -1);

    } else {
      this.hoverLabel.classed(this.classes.hide, false)
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
        tooltipText,
        text,
        textWidth,
        textHeight,
        d;

    if (xPos > this.w) {
      return;
    }

    for (var i = 0, len = this.tooltips.length; i < len; i++) {
      if (xPos < 0) {
        this.tooltips[i].classed(this.classes.hide, true);
      } else {
        this.tooltips[i].classed(this.classes.hide, false);
      }

      textXPos = 10;
      textYPos = -15;

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

      tooltipText = this.tooltips[i]
        .attr('transform', 'translate(' + xPos + ',' + yPos + ')')
        .select('text');

      tooltipText.text(text)
        .attr('x', textXPos)
        .attr('y', textYPos);

      textWidth = tooltipText.style('width');
      textWidth = parseInt(textWidth, 10) + 10;
      textHeight = tooltipText.style('height');
      textHeight = parseInt(textHeight, 10) + 10;
      d = this.createTooltipPath(textWidth, textHeight);

      this.tooltips[i].select('path')
        .attr('d', d);
    }
  };

  this.createTooltipPath = function(textWidth, textHeight) {
    var yOffset = -10,
        xOffset = 5,
        openingWidth = 4;

    var d = [
      'M' + xOffset + ',0',
      'L' + (((xOffset + textWidth) / 2) - openingWidth) + ',' + yOffset,
      'L' + xOffset + ',' + yOffset,
      'L' + xOffset + ',-' + textHeight,
      'L' + (xOffset + textWidth) + ',-' + textHeight,
      'L' + (xOffset + textWidth) + ',' + yOffset,
      'L' + (((xOffset + textWidth) / 2) + openingWidth) + ',' + yOffset,
      'L' + xOffset + ',0'
    ].join('');

    return d;
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

    this.graph.selectAll(this.selectors.xAxis).remove();

    this.graph.append('svg:g')
      .attr('class', this.classes.xAxis)
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

    this.graph.selectAll(this.selectors.yAxis).remove();

    this.graph.append('svg:g')
      .attr('class', this.classes.yAxis)
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
      .attr('class', this.classes.hoverLine)
      .classed(this.classes.hide, true);
  };

  this.drawHoverLabel = function() {
    this.hoverLabel = this.graph.append('g')
      .append('text')
      .attr('x', 0)
      .attr('y', this.h + 50)
      .attr('class', this.classes.hoverLabel)
      .classed(this.classes.hide, true);
  };

  this.addLine = function(data, label, tooltipFn, isInterpolated) {
    if (data[0].y === 0 && data[data.length - 1].y === 0) {
      return;
    }
    
    this.lines.push({
      data: data,
      label: label,
      tooltipFn: tooltipFn,
      isInterpolated: isInterpolated
    });
  };

  this.drawLines = function() {
    var len = this.lines.length,
        i;

    // Sort from lowest to highest tax rate
    this.lines.sort(function(a, b) {
      var yValueA = a.data[a.data.length - 1].y,
          yValueB = b.data[b.data.length - 1].y;

      return yValueA - yValueB;
    });

    for (i = 0; i < len; i++) {
      this.drawLine(this.lines[i].data, this.lines[i].isInterpolated);
      this.changeColor();
    }

    this.colorIndex = 0;

    // Make sure tooltips are rendered on top of line
    for (i = 0; i < len; i++) {
      this.drawTooltip(this.lines[i].tooltipFn);
      this.drawLabel(this.lines[i].data, this.lines[i].label);
      this.changeColor();
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
      .attr('class', this.classes.line)
      .attr('stroke', this.settings.colors[this.colorIndex])
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
      .attr('stroke-dashoffset', 0)
      .each('end', this.moveHoverLineToEnd.bind(this));
  };

  this.drawTooltip = function(tooltipFn) {
    // http://bl.ocks.org/mbostock/3902569
    var tooltip = this.graph.append('g')
      .attr('class', this.classes.tooltip)
      .classed(this.classes.hide, true);

    tooltip.append('circle')
      .attr('class', this.classes.circle)
      .attr('fill', this.settings.colors[this.colorIndex])
      .attr('r', 4);

    tooltip.append('path');

    tooltip.append('text')
      .attr('x', 5)
      .attr('y', -5);

    this.tooltips.push(tooltip);

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
      .attr('class', this.classes.label)
      .classed(this.classes.hide, true);
      
    label.append('text')
      .attr('x', 10)
      .attr('y', -5)
      .text(text);

    this.labelPositions.push(yPos);
  };

  this.changeColor = function() {
    this.colorIndex = (this.colorIndex + 1) % this.settings.colors.length;
  };

  this.resetTooltips = function() {
    this.updateHoverLine(-1);
    this.labelPositions.length = 0;
    this.tooltips.length = 0;
    this.tooltipFns.length = 0;
    this.colorIndex = 0;
    this.graph.selectAll(this.selectors.label).remove();
  };

  this.clear = function() {
    this.resetTooltips();
    this.lines.length = 0;
    this.graph.selectAll(this.selectors.line).transition().duration(0);
    this.graph.selectAll(this.selectors.tooltip).remove();
    this.graph.selectAll(this.selectors.line).remove();
  };
};