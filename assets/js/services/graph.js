import angular from '../lib/angular';
import '../lib/Math.round10';

Number.isNaN = require('is-nan');

/* eslint-disable no-use-before-define, no-param-reassign */
/* @ngInject */
function graph(d3, screenService, settings) {
  const service = {};
  const { graphDefaults, xAxisScales, axisFormats } = settings;

  function createSelector(string) {
    return `.${string.split(' ').join('.')}`;
  }

  service.classes = {
    controls: 'controls',
    data: 'data',
    title: 'title',
    primaryTitle: 'primary',
    secondaryTitle: 'secondary',
    line: 'tax',
    hoverLine: 'hover',
    hoverLabel: 'hoverlabel',
    tooltip: 'tooltip',
    tooltipOutline: 'tooltip-outline',
    tooltipTrim: 'tooltip-trim',
    circle: 'point',
    lineLabel: 'label',
    lineValue: 'value',
    xAxis: 'x axis',
    yAxis: 'y axis',
    xAxisLabel: 'x axis-label',
    yAxisLabel: 'y axis-label',
    hide: 'hide',
  };

  service.selectors = {};

  Object.keys(service.classes).forEach((prop) => {
    service.selectors[prop] = createSelector(service.classes[prop]);
  });

  service.settings = { ...graphDefaults };
  service.defaults = { ...graphDefaults };

  service.colors = [
    '#396AB1',
    '#CC2529',
    '#3E9651',
    '#DA7C30',
    '#535154',
    '#6B4C9A',
    '#922428',
    '#948B3D',
  ];

  service.init = (initSettings) => {
    if (service.hasInited) {
      return;
    }

    service.svg = d3.select('svg');
    service.graph = service.svg.append('svg:g');
    service.settings = initSettings || service.settings;

    service.lines = [];
    service.tooltips = [];
    service.tooltipFns = [];
    service.colorIndex = 0;

    service.setSize();
    service.createGraph();
    service.setupEventHandlers();
    service.hasInited = true;
  };

  service.setSize = () => {
    let width;
    let height;

    const parent = service.svg.select(function select() {
      return this.parentNode;
    });

    if (screenService.isMobile()) {
      width = screenService.width - 5;
      height = screenService.height - 45;
      service.m = [50, 40, 75, 75];
    } else {
      width = parseInt(parent.style('width'), 10) - 10;
      height = parseInt(parent.style('height'), 10) - 15;
      service.m = [80, 40, 75, 80];
    }

    service.w = width - service.m[1] - service.m[3];
    service.h = height - service.m[0] - service.m[2];

    service.svg
      .attr('width', `${width}px`)
      .attr('height', `${height}px`);

    service.graph.attr('transform', `translate(${service.m[3]},${service.m[0]})`);
  };

  service.createGraph = () => {
    service.createElements();
    service.positionText();
    service.updateXAxis();
    service.updateYAxis();
    service.drawHoverLine();
    service.drawHoverLabel();
  };

  service.createElements = () => {
    service.title = service.graph.append('svg:g').attr('class', service.classes.title);

    const text = service.title.append('text');

    text.append('tspan').attr('class', service.classes.primaryTitle);

    text
      .append('tspan')
      .attr('class', service.classes.secondaryTitle)
      .attr('x', 0)
      .attr('dy', '1.2em');

    service.xAxisLabel = service.graph.append('text').attr('class', service.classes.xAxisLabel);

    service.yAxisLabel = service.graph.append('text').attr('class', service.classes.yAxisLabel);

    service.controls = service.graph.append('svg:g').attr('class', service.classes.controls);

    service.data = service.graph.append('svg:g').attr('class', service.classes.data);
  };

  service.positionText = () => {
    service.title.attr('transform', `translate(${service.w / 2},${-service.m[0] / 2})`);

    service.xAxisLabel.attr('x', service.w / 2).attr('y', service.h + 70);

    service.yAxisLabel
      .attr('transform', 'rotate(-90)')
      .attr('x', -service.h / 2)
      .attr('y', -55);
  };

  service.updateXAxis = (xMax) => {
    xMax = Number.isNaN(xMax) ? service.defaults.xMax : xMax;
    service.settings.xMax = xMax;

    const ticks = screenService.isMobile() ? 3 : 6;

    if (service.settings.xAxisScale === xAxisScales.log) {
      service.x = d3.scale
        .log()
        .domain([service.settings.xMin + 1, service.settings.xMax])
        .range([0, service.w])
        .nice();

      service.xAxis = d3.svg.axis().scale(service.x).orient('bottom');
    } else {
      service.x = d3.scale
        .linear()
        .domain([service.settings.xMin, service.settings.xMax])
        .range([0, service.w]);

      service.xAxis = d3.svg
        .axis()
        .scale(service.x)
        .ticks(ticks)
        .tickSize(-service.h, 0)
        .tickFormat(service.xAxisFormat)
        .tickPadding(10)
        .orient('bottom');
    }

    service.controls.selectAll(service.selectors.xAxis).remove();

    service.controls
      .append('svg:g')
      .attr('class', service.classes.xAxis)
      .attr('transform', `translate(0,${service.h})`)
      .call(service.xAxis);
  };

  service.updateYAxis = (yMax) => {
    yMax = Number.isNaN(yMax) ? service.defaults.yMax : yMax;
    service.settings.yMax = yMax;

    service.y = d3.scale
      .linear()
      .domain([service.settings.yMin, service.settings.yMax])
      .range([service.h, 0]);

    service.yAxis = d3.svg
      .axis()
      .scale(service.y)
      .ticks(Math.ceil(yMax / Math.pow(10, Math.ceil(Math.log10(yMax)) - 1)))
      .tickSize(-service.w, 0)
      .tickFormat(service.yAxisFormat)
      .tickPadding(7)
      .orient('left');

    service.controls.select(service.selectors.yAxis).remove();

    service.controls
      .append('svg:g')
      .attr('class', service.classes.yAxis)
      .attr('transform', 'translate(0,0)')
      .call(service.yAxis)
      .selectAll('.tick')
      .filter((d) => d === 0)
      .remove();
  };

  service.drawHoverLine = () => {
    // http://bl.ocks.org/benjchristensen/2657838
    service.hoverLine = service.controls
      .append('svg:line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', service.h)
      .attr('class', service.classes.hoverLine)
      .classed(service.classes.hide, true);
  };

  service.drawHoverLabel = () => {
    service.hoverLabel = service.controls
      .append('g')
      .append('text')
      .attr('x', 0)
      .attr('y', service.h + 50)
      .attr('class', service.classes.hoverLabel)
      .classed(service.classes.hide, true);
  };

  service.updateTitle = (primary, secondary) => {
    service.title.select(service.selectors.primaryTitle).text(primary);
    service.title.select(service.selectors.secondaryTitle).text(secondary);
  };

  service.updateAxisLabels = (xAxisLabel, yAxisLabel) => {
    service.xAxisLabel.text(xAxisLabel);
    service.yAxisLabel.text(yAxisLabel);
  };

  service.updateAxisFormats = (xAxisFormat, yAxisFormat) => {
    const d3Formats = {
      [axisFormats.dollar]: '$.2s',
      [axisFormats.number]: ',.0f',
      [axisFormats.percent]: '%',
    };

    const d3LabelFormats = {
      [axisFormats.dollar]: '$0,000',
      [axisFormats.number]: ',.0f',
      [axisFormats.percent]: '%',
    };

    service.xAxisLabelFormat = d3.format(d3LabelFormats[xAxisFormat]);
    service.xAxisFormat = d3.format(d3Formats[xAxisFormat]);
    service.yAxisFormat = d3.format(d3Formats[yAxisFormat]);
  };

  service.updateAnimationTime = (time) => {
    time = Number.isNaN(time) ? service.defaults.animationTime : time;
    service.settings.animationTime = time;
  };

  service.update = ({
    xMax, xAxisScale, yMax, animationTime,
  }) => {
    if (xMax) {
      service.settings.xAxisScale = xAxisScale;
      service.updateXAxis(xMax);
    }

    if (yMax) {
      service.updateYAxis(yMax);
    }

    if (animationTime != null) {
      service.updateAnimationTime(animationTime);
    }
  };

  service.addLine = (line) => {
    const { data, alwaysShow } = line;
    // Don't draw lines that start at y = 0 and end at y = 0
    if (!alwaysShow && data[0].y === 0 && data[data.length - 1].y === 0) {
      return;
    }

    if (service.settings.xAxisScale === xAxisScales.log) {
      data[0].x = 1;
    }

    service.lines.push(line);
  };

  service.drawLines = () => {
    const len = service.lines.length;

    if (len < 1) {
      return;
    }

    // Sort from lowest to highest tax rate
    service.lines.sort((a, b) => {
      const yValueA = a.data[a.data.length - 1].y;
      const yValueB = b.data[b.data.length - 1].y;

      return yValueB - yValueA;
    });

    service.scaleYAxis();
    service.updateHoverLabel(-1);

    service.lines.forEach((line) => {
      service.drawLine(line.data, line.isInterpolated);
      service.changeColor();
    });

    service.colorIndex = 0;

    // Make sure tooltips are rendered after lines (and appear on top of lines)
    service.lines.forEach((line) => {
      service.drawTooltip(line.tooltipFn, line.label);
      service.changeColor();
    });

    if (service.settings.animationTime < 100) {
      service.moveHoverLineToEnd();
    }
  };

  // Automatically scales the y-axis based on the input data
  service.scaleYAxis = () => {
    const highestLine = service.lines[0];
    const firstY = highestLine.data[0].y;
    const lastY = highestLine.data[highestLine.data.length - 1].y;
    const highestY = firstY > lastY ? firstY : lastY;
    const factor = Math.ceil(Math.log10(highestY)) - 1;
    const roundUpAmount = 0.5 * Math.pow(10, factor);
    const yMax = Math.ceil10(highestY + roundUpAmount, factor);

    service.updateYAxis(yMax);
  };

  service.drawLine = (data, isInterpolated) => {
    const line = d3.svg
      .line()
      .x(({ x }) => service.x(x))
      .y(({ y }) => service.y(y));

    if (isInterpolated) {
      line.interpolate('basis');
    }

    const path = service.data
      .append('svg:path')
      .attr('class', service.classes.line)
      .attr('fill', 'none')
      .attr('stroke', service.colors[service.colorIndex])
      .attr('d', line(data));

    if (service.settings.animationTime > 100) {
      service.animatePath(path);
    }
  };

  service.animatePath = (path) => {
    const length = path.node().getTotalLength();

    path
      .attr('stroke-dasharray', `${length} ${length}`)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(service.settings.animationTime)
      .ease('linear')
      .attr('stroke-dashoffset', 0)
      .each('end', service.moveHoverLineToEnd);
  };

  service.drawTooltip = (tooltipFn, label) => {
    // http://bl.ocks.org/mbostock/3902569
    const tooltip = service.data
      .append('g')
      .attr('class', service.classes.tooltip)
      .classed(service.classes.hide, true);

    tooltip
      .append('circle')
      .attr('class', service.classes.circle)
      .attr('fill', service.colors[service.colorIndex])
      .attr('r', 4);

    tooltip.append('path').attr('class', service.classes.tooltipOutline);

    tooltip
      .append('path')
      .attr('class', service.classes.tooltipTrim)
      .attr('stroke', service.colors[service.colorIndex]);

    const text = tooltip.append('text').attr('x', 5).attr('y', -5);

    text.append('tspan').attr('class', service.classes.lineLabel).text(label);

    text.append('tspan').attr('class', service.classes.lineValue).attr('x', 8).attr('dy', '1.2em');

    service.tooltips.push(tooltip);

    if (tooltipFn) {
      service.tooltipFns.push(tooltipFn);
    } else {
      service.tooltipFns.push(angular.noop);
    }
  };

  service.changeColor = () => {
    const len = service.colors.length;
    service.colorIndex = (service.colorIndex + 1) % len;
  };

  service.setupEventHandlers = () => {
    service.svg.on('mousemove', function onMouseMove() {
      const xPos = d3.mouse(this)[0] - service.m[3];
      service.updateHoverLine(xPos);
      service.updateHoverLabel(xPos);
    });

    screenService.addResizeEvent(service.redrawGraph);
  };

  service.redrawGraph = () => {
    service.setSize();
    service.positionText();
    service.update(service.settings);
    service.removeRenderedData();
    service.drawLines();
    service.updateHoverLine(-1);
  };

  service.updateHoverLine = (xPos) => {
    const xChange = Math.abs(xPos - service.hoverLine.attr('x1'));
    if (xChange < 0.5 || xPos > service.w) {
      return;
    }

    if (xPos < 0) {
      service.hoverLine.classed(service.classes.hide, true).attr('x1', -1).attr('x2', -1);
    } else {
      service.hoverLine
        .classed(service.classes.hide, false)
        .attr('x1', xPos)
        .attr('x2', xPos)
        .attr('y1', 0)
        .attr('y2', service.h);
    }

    service.updateTooltips(xPos);
  };

  service.moveHoverLineToEnd = () => {
    if (service.hoverLine.attr('x1') < 0) {
      service.updateHoverLine(service.w);
    }

    service.graph.selectAll(service.selectors.label).classed(service.classes.hide, false);
  };

  service.updateHoverLabel = (xPos) => {
    const xChange = Math.abs(xPos - service.hoverLabel.attr('x'));
    // http://bl.ocks.org/zoopoetics/7684278
    const xValue = Math.round(service.x.invert(xPos));

    if (xChange < 0.5 || xPos > service.w) {
      return;
    }

    if (xPos < 0) {
      service.hoverLabel.classed(service.classes.hide, true).attr('x', -1);
    } else {
      service.hoverLabel
        .classed(service.classes.hide, false)
        .attr('x', xPos)
        .attr('y', service.h + 45)
        .text(service.xAxisLabelFormat(xValue));
    }
  };

  service.getTextYPos = () => (screenService.isMobile() ? -32 : -34);

  service.updateTooltips = (xPos) => {
    const xValue = Math.round(service.x.invert(xPos));
    const yScale = service.settings.yMax / service.h;
    const textPos = [];
    const textYPos = service.getTextYPos();
    const textXPos = 10;
    const yOffset = -10;
    let showTooltipOnLeft = false;

    if (xPos > service.w) {
      return;
    }

    service.tooltips.forEach((tooltip, i) => {
      const hide = xPos < 0;
      tooltip.classed(service.classes.hide, hide);

      const yValue = service.tooltipFns[i](xValue) || 0;
      const yPos = service.h - (yValue / yScale);
      const text = service.lines[i].formattedFn
        ? service.lines[i].formattedFn(xValue, yValue)
        : yValue;

      const tooltipText = tooltip
        .attr('transform', `translate(${xPos},${yPos})`)
        .select('text')
        .attr('x', textXPos)
        .attr('y', textYPos);

      tooltipText.select(service.selectors.lineValue).attr('x', textXPos).text(text);

      // https://github.com/robwalch/svg.js/blob/00c786e50ceae8d7514dda609691f842cded9a82/src/bbox.js
      // Fixes Firefox NS_ERROR_FAILURE when getting the bounding box
      let box;
      try {
        box = tooltipText.node().getBBox();
      } catch (err) {
        box = {
          x: tooltipText.node().clientLeft,
          y: tooltipText.node().clientTop,
          width: tooltipText.node().clientWidth,
          height: tooltipText.node().clientHeight,
        };
      }

      const textHeight = box.height + 3;
      const textWidth = box.width + 10;
      const xOffset = textXPos - 2;

      // Show all tooltips on left if any tooltip exceeds the viewport
      showTooltipOnLeft = showTooltipOnLeft || (xPos + textWidth > service.w);

      textPos.push({
        tooltipY: yPos,
        textWidth,
        textHeight,
        xOffset,
        i,
      });
    });

    service.tooltips.forEach((tooltip, i) => {
      const tooltipText = tooltip.select('text');
      const { textWidth, textHeight, xOffset } = textPos[i];

      if (showTooltipOnLeft) {
        const leftX = -(xOffset + textWidth - 4);
        tooltipText.attr('x', leftX);
        tooltipText.select(service.selectors.lineValue).attr('x', leftX);
      }

      const opts = [textWidth, textHeight, xOffset, yOffset, showTooltipOnLeft];
      tooltip.select(service.selectors.tooltipOutline).attr('d', service.createTooltipPath(...opts));
      tooltip.select(service.selectors.tooltipTrim).attr('d', service.createTooltipTrim(...opts));
    });

    service.fixTooltipOverlaps(textPos, showTooltipOnLeft);
  };

  service.createTooltipPath = (textWidth, textHeight, xOffset, yOffset, showOnLeft) => {
    const openingWidth = 6;

    if (showOnLeft) {
      xOffset *= -1;
      textWidth *= -1;
    }

    const d = [
      'M0,0',
      `L${(xOffset + textWidth) / 2 - openingWidth},${yOffset}`,
      `L${xOffset},${yOffset}`,
      `L${xOffset},${yOffset - textHeight}`,
      `L${xOffset + textWidth},${yOffset - textHeight}`,
      `L${xOffset + textWidth},${yOffset}`,
      `L${(xOffset + textWidth) / 2 + openingWidth},${yOffset}`,
      'L0,0',
    ].join('');

    return d;
  };

  service.createTooltipTrim = (textWidth, textHeight, xOffset, yOffset, showOnLeft) => {
    if (showOnLeft) {
      xOffset *= -1;
      textWidth *= -1;
    }

    const d = [
      `M${xOffset},${yOffset - textHeight}`,
      `L${xOffset + textWidth},${yOffset - textHeight}`,
    ].join('');

    return d;
  };

  service.fixTooltipOverlaps = (textPos, showTooltipOnLeft) => {
    const textYPos = service.getTextYPos();
    const textXPos = 8;
    const yOffset = -10;
    const tooltipHeight = 45;
    const maxNumLines = 14;
    const dataEl = service.data.node();
    let d;
    let len;
    let i;

    textPos.sort((a, b) => a.tooltipY - b.tooltipY);

    for (len = textPos.length - 1, i = len; i > 0; i -= 1) {
      const yDist = textPos[i].tooltipY - textPos[i - 1].tooltipY;

      if (len < maxNumLines && yDist < tooltipHeight) {
        const diff = yDist - tooltipHeight;

        service.tooltips[textPos[i - 1].i].select('text').attr('y', textYPos + diff);

        const opts = [
          textPos[i - 1].textWidth,
          textPos[i - 1].textHeight,
          textXPos - 2,
          yOffset + diff,
          showTooltipOnLeft,
        ];

        d = service.createTooltipPath(...opts);
        service.tooltips[textPos[i - 1].i].select(service.selectors.tooltipOutline).attr('d', d);

        d = service.createTooltipTrim(...opts);
        service.tooltips[textPos[i - 1].i].select(service.selectors.tooltipTrim).attr('d', d);

        textPos[i - 1].tooltipY += diff;
      }
    }

    // Remove path overlaps by rearranging the node order in the DOM
    if (len < maxNumLines) {
      for (i = 0; i <= len; i += 1) {
        dataEl.appendChild(service.tooltips[textPos[i].i].node());
      }
      // If too many lines, then just make sure to show the first and last node
    } else {
      dataEl.appendChild(service.tooltips[textPos[0].i].node());
      dataEl.appendChild(service.tooltips[textPos[len].i].node());
    }
  };

  service.removeRenderedData = () => {
    service.updateHoverLine(-1);
    service.tooltips.length = 0;
    service.tooltipFns.length = 0;
    service.colorIndex = 0;
    service.graph.selectAll(service.selectors.tooltip).remove();
    service.graph.selectAll(service.selectors.line).transition().duration(0);
    service.graph.selectAll(service.selectors.line).remove();
  };

  service.resetData = () => {
    service.lines.length = 0;
  };

  service.clear = () => {
    service.removeRenderedData();
    service.resetData();
  };

  return service;
}

export default graph;
