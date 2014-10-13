'use strict';

module.exports = function(d3, _, screenService) {
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

  this.animationTimes = [0, 500, 1000, 2000, 3000, 5000, 10000, 20000];

  this.classes = {
    controls: 'controls',
    data: 'data',
    title: 'title',
    line: 'tax',
    hoverLine: 'hover',
    hoverLabel: 'hoverlabel',
    tooltip: 'tooltip',
    circle: 'point',
    lineLabel: 'label',
    lineValue: 'value',
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
    xMax: 300000,
    yMin: 0,
    yMax: 60,
    animationTime: 3000,
    colors: this.colors.multi
  };

  this.defaults = _.cloneDeep(this.settings);

  this.init = function(settings) {
    if (this.hasInited) {
      return;
    }
    
    this.svg = d3.select('svg');
    this.settings = settings || this.settings;

    this.lines = [];
    this.tooltips = [];
    this.tooltipFns = [];
    this.colorIndex = 0;

    this.setSize();
    this.createGraph();
    this.setupEventHandlers();
    this.hasInited = true;
  };

  this.setSize = function() {
    var parent, width, height;

    parent = this.svg.select(function() { 
      return this.parentNode; 
    });

    width = parseInt(parent.style('width'), 10) - 10;
    height = parseInt(parent.style('height'), 10) - 10;

    if (screenService.width < screenService.sizes.md) {
      width = screenService.width - 20;
      height = screenService.height - 45;
    }

    this.m = [80, 180, 80, 70];
    this.w = width - this.m[1] - this.m[3]; 
    this.h = height - this.m[0] - this.m[2];
  };

  this.createGraph = function() {
    this.svg
      .attr('width', this.w + this.m[1] + this.m[3] + 'px')
      .attr('height', this.h + this.m[0] + this.m[2] + 'px');

    this.graph = this.svg
      .append('svg:g')
      .attr('transform', 'translate(' + this.m[3] + ',' + this.m[0] + ')');

    this.title = this.graph
      .append('svg:g')
      .attr('class', this.classes.title)
      .attr('transform', 'translate(' +
        (this.w / 2) + ',' + (-this.m[0] / 2) + ')')
      .append('text');

    this.controls = this.graph
      .append('svg:g')
      .attr('class', this.classes.controls);

    this.data = this.graph
      .append('svg:g')
      .attr('class', this.classes.data);

    this.updateXAxis();
    this.updateYAxis();
    this.drawHoverLine();
    this.drawHoverLabel();
  };

  this.updateXAxis = function(xMax) {
    var ticks, format;

    xMax = isNaN(xMax) ? this.defaults.xMax : xMax;
    this.settings.xMax = xMax;

    if (screenService.width < screenService.sizes.lg) {
      ticks = 3;
      format = d3.format('$.1s');
    } else {
      ticks = 6;
      format = d3.format('$0,000');
    }

    this.x = d3.scale.linear()
      .domain([this.settings.xMin, this.settings.xMax])
      .range([0, this.w]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(ticks)
      .tickSize(-this.h, 0)
      .tickFormat(format)
      .tickPadding(10)
      .orient('bottom');

    this.controls.selectAll(this.selectors.xAxis).remove();

    this.controls.append('svg:g')
      .attr('class', this.classes.xAxis)
      .attr('transform', 'translate(0,' + this.h + ')')
      .call(this.xAxis);
  };

  this.updateYAxis = function(yMax) {
    yMax = isNaN(yMax) ? this.defaults.yMax : yMax;
    this.settings.yMax = yMax;

    this.y = d3.scale.linear()
      .domain([this.settings.yMin / 100, this.settings.yMax / 100])
      .range([this.h, 0]);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .ticks(Math.ceil(yMax / 10))
      .tickSize(-this.w, 0)
      .tickFormat(d3.format('%'))
      .tickPadding(7)
      .orient('left');

    this.controls.select(this.selectors.yAxis).remove();

    this.controls.append('svg:g')
      .attr('class', this.classes.yAxis)
      .attr('transform', 'translate(0,0)')
      .call(this.yAxis)
      .selectAll('.tick')
        .filter(function (d) { return d === 0; })
        .remove();
  };

  this.drawHoverLine = function() {
    // http://bl.ocks.org/benjchristensen/2657838
    this.hoverLine = this.controls.append('svg:line')
      .attr('x1', 0).attr('x2', 0)
      .attr('y1', 0).attr('y2', this.h)
      .attr('class', this.classes.hoverLine)
      .classed(this.classes.hide, true);
  };

  this.drawHoverLabel = function() {
    this.hoverLabel = this.controls.append('g')
      .append('text')
      .attr('x', 0)
      .attr('y', this.h + 50)
      .attr('class', this.classes.hoverLabel)
      .classed(this.classes.hide, true);
  };

  this.updateTitle = function(title) {
    this.title.text(title);
  };

  this.updateAnimationTime = function(time) {
    time = isNaN(time) ? this.defaults.animationTime : time;
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

  this.addLine = function(data, label, tooltipFn, isInterpolated) {
    // Don't draw lines that start at y = 0 and end at y = 0
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

      return yValueB - yValueA;
    });

    this.scaleYAxis();
    this.updateHoverLabel(-1);

    for (i = 0; i < len; i++) {
      this.drawLine(this.lines[i].data, this.lines[i].isInterpolated);
      this.changeColor();
    }

    this.colorIndex = 0;

    // Make sure tooltips are rendered after lines (and appear on top of lines)
    for (i = 0; i < len; i++) {
      this.drawTooltip(this.lines[i].tooltipFn, this.lines[i].label);
      this.changeColor();
    }

    if (this.settings.animationTime < 100) {
      this.moveHoverLineToEnd();
    }
  };

  // Automatically scales the y-axis based on the input data
  this.scaleYAxis = function() {
    var highestLine = this.lines[0],
        highestY = highestLine.data[highestLine.data.length - 1].y,
        yMax = Math.ceil((highestY + 0.05) * 10) * 10;

    this.updateYAxis(yMax);
  };
        
  this.drawLine = function(data, isInterpolated) {
    var line = d3.svg.line()
      .x(function(d) { return this.x(d.x); }.bind(this))
      .y(function(d) { return this.y(d.y); }.bind(this));

    if (isInterpolated) {
      line.interpolate('basis');
    }

    var path = this.data.append('svg:path')
      .attr('class', this.classes.line)
      .attr('fill', 'none')
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

  this.drawTooltip = function(tooltipFn, label) {
    // http://bl.ocks.org/mbostock/3902569
    var tooltip = this.data.append('g')
      .attr('class', this.classes.tooltip)
      .classed(this.classes.hide, true);

    tooltip.append('circle')
      .attr('class', this.classes.circle)
      .attr('fill', this.settings.colors[this.colorIndex])
      .attr('r', 4);

    tooltip.append('path');

    var text = tooltip.append('text')
      .attr('x', 5)
      .attr('y', -5);

    text.append('tspan')
      .attr('class', this.classes.lineLabel)
      .text(label);

    text.append('tspan')
      .attr('class', this.classes.lineValue)
      .attr('x', 8)
      .attr('dy', '1.2em');

    this.tooltips.push(tooltip);

    if (tooltipFn) {
      this.tooltipFns.push(tooltipFn);
    } else {
      this.tooltipFns.push(noop);
    }
  };

  this.changeColor = function() {
    this.colorIndex = (this.colorIndex + 1) % this.settings.colors.length;
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
        xScale = this.settings.xMax / this.w,
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
    var xScale = this.settings.xMax / this.w,
        yScale = this.settings.yMax / this.h,
        xValue = Math.round(xPos * xScale),
        textPos = [],
        textYPos = -35,
        textXPos = 10,
        yOffset = -10,
        hide,
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
      hide = (xPos < 0);
      this.tooltips[i].classed(this.classes.hide, hide);

      yValue = this.tooltipFns[i](xValue);

      if (!yValue) {
        yValue = 0;
      }

      yPos = this.h - (yValue / yScale * 100);
      text = Math.round10(yValue * 100, -2) + '%';

      tooltipText = this.tooltips[i]
        .attr('transform', 'translate(' + xPos + ',' + yPos + ')')
        .select('text')
        .attr('x', textXPos)
        .attr('y', textYPos);
      
      tooltipText.select(this.selectors.lineValue)
        .attr('x', textXPos)
        .text(text);

      textWidth = tooltipText.node().getBBox().width + 10;
      textHeight = tooltipText.node().getBBox().height + 3;
      d = this.createTooltipPath(textWidth, textHeight, textXPos - 3, yOffset);

      this.tooltips[i].select('path')
        .attr('d', d);

      textPos.push({
        tooltipY: yPos,
        textWidth: textWidth,
        textHeight: textHeight,
        i: i
      });
    }

    this.fixTooltipOverlaps(textPos);
  };

  this.createTooltipPath = function(textWidth, textHeight, xOffset, yOffset) {
    var openingWidth = 6;

    var d = [
      'M0,0',
      'L' + (((xOffset + textWidth) / 2) - openingWidth) + ',' + yOffset,
      'L' + xOffset + ',' + yOffset,
      'L' + xOffset + ',' + (yOffset - textHeight),
      'L' + (xOffset + textWidth) + ',' + (yOffset - textHeight),
      'L' + (xOffset + textWidth) + ',' + yOffset,
      'L' + (((xOffset + textWidth) / 2) + openingWidth) + ',' + yOffset,
      'L0,0'
    ].join('');

    return d;
  };

  this.fixTooltipOverlaps = function(textPos) {
    var textYPos = -35,
        textXPos = 8,
        yOffset = -10,
        tooltipHeight = 45,
        maxNumLines = 12,
        yDist,
        diff,
        d;

    textPos.sort(function(a, b) {
      return a.tooltipY - b.tooltipY;
    });

    for (var len = textPos.length - 1, i = len; i > 0; i--) {
      yDist = textPos[i].tooltipY - textPos[i-1].tooltipY;

      if (len < maxNumLines && yDist < tooltipHeight) {
        diff = yDist - tooltipHeight;

        this.tooltips[textPos[i-1].i].select('text')
          .attr('y', textYPos + diff);

        d = this.createTooltipPath(textPos[i-1].textWidth,
          textPos[i-1].textHeight, textXPos - 3, 
          yOffset + diff);

        this.tooltips[textPos[i-1].i].select('path')
          .attr('d', d);

        textPos[i-1].tooltipY += diff;
      }
    }
  };

  this.resetTooltips = function() {
    this.updateHoverLine(-1);
    this.tooltips.length = 0;
    this.tooltipFns.length = 0;
    this.colorIndex = 0;
  };

  this.clear = function() {
    this.resetTooltips();
    this.lines.length = 0;
    this.graph.selectAll(this.selectors.tooltip).remove();
    this.graph.selectAll(this.selectors.line).transition().duration(0);
    this.graph.selectAll(this.selectors.line).remove();
  };
};