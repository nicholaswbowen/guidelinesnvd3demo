'use strict';

var dataSet = exampleData();

function addGuides(chartElement, axisScale, axisName) {
  var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function (d) {
    return '<div style=\'background-color: lightblue\'>\n    <strong>Mean of ' + d.key + ':</strong>\n    <span style=\'color:red\'>' + d.mean + '</span>\n    </div>';
  });
  var boundingBox = d3.select(chartElement)[0][0].getBBox();
  findMeans(dataSet, axisName).then(function (means) {
    var attrJSON = void 0;
    var axisElement = void 0;
    if (axisName === "x") {
      attrJSON = { "x": 0,
        "y": 0,
        "transform": function transform(d) {
          return 'translate( ' + axisScale()(Math.round(d.mean)) + ', 0 ) ';
        },
        "width": "1px",
        "height": boundingBox.height,
        "class": "my-guide-lines" };
    } else {
      attrJSON = { "x": 0,
        "y": function y(d) {
          return axisScale()(d.mean);
        },
        "width": boundingBox.width,
        "height": "1px",
        "class": "my-guide-lines" };
    }
    d3.select(chartElement).call(tip).append('g').selectAll('rect').data(means).enter().append('rect').attr(attrJSON).on('mouseover', tip.show).on('mouseout', tip.hide);
  });
}
nv.addGraph(function () {
  var svg = d3.select('#graphsvg');
  var chart = nv.models.multiBarChart().duration(350).reduceXTicks(true) //If 'false', every single x-axis tick label will be rendered.
  .rotateLabels(0) //Angle to rotate x-axis labels.
  .showControls(true) //Allow user to switch between 'Grouped' and 'Stacked' mode.
  .groupSpacing(0.1) //Distance between each group of bars.
  .hideable(true);
  chart.xAxis.tickFormat(d3.format(',f'));

  chart.yAxis.tickFormat(d3.format(',.1f'));

  svg.datum(dataSet).call(chart);
  addGuides(".nvd3.nv-wrap.nv-multiBarWithLegend g", chart.xAxis.scale, "x");
  addGuides(".nvd3.nv-wrap.nv-multiBarWithLegend g", chart.yAxis.scale, "y");
  nv.utils.windowResize(chart.update);
  return chart;
});

function findMeans(dataSet, axis) {
  return new Promise(function (resolve, reject) {
    var result = dataSet.map(function (stream) {
      var total = 0;
      stream.values.forEach(function (value) {
        total += value[axis];
      });
      return { mean: total / stream.values.length, key: stream.key };
    });
    console.log(result);
    resolve(result);
  });
}
//Generate some nice data.
function exampleData() {
  return stream_layers(3, 10 + Math.random() * 100, .1).map(function (data, i) {
    return {
      key: 'Stream #' + i,
      values: data
    };
  });
}