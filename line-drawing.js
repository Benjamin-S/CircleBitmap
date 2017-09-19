// From http://www.redblobgames.com/making-of/line-drawing/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

const scale = 22;


function pointsOnACircle(x0, y0, radius) {
  let points = [];
  var x = -radius;
  var y = 0;
  var err = 2-2*radius;

  while (x < 0) {
    points.push({x: x0 + x, y: y0 + y});
    points.push({x: x0 + y, y: y0 + x});
    points.push({x: x0 - y, y: y0 + x});
    points.push({x: x0 - x, y: y0 + y});
    points.push({x: x0 - x, y: y0 - y});
    points.push({x: x0 - y, y: y0 - x});
    points.push({x: x0 + y, y: y0 - x});
    points.push({x: x0 + x, y: y0 - y});

    radius = err;
    if (radius <= y) {
      err += ++y*2+1;
    }
    if (radius > x || err > y) {
      err += ++x*2+1;
    }
  }
  return points;
}

function lerp(start, end, t) {
    return start + t * (end-start);
}

class Diagram {
  constructor(containerID) {
    this.root = d3.select(`#${containerID}`);
    this.A = 10;
    this.B = 10;
    this.t = 10;
    this.R = this.t;
    this.parent = d3.select(`#${containerID} svg`);
    this.gGrid = this.parent.append('g');
    this.gPoints = this.parent.append('g');

    this.drawGrid();
    this.makeScrubbableNumber('t', 0.0, 100, 0);
    this.update();
  }

  update() {
    console.log(this.t);
    let rects = this.gPoints.selectAll('rect').data(pointsOnACircle(this.t, this.t, this.t-1));
    console.log(this.t);
    rects.exit().remove();
    rects.enter().append('rect')
      .attr('width', scale - 1)
      .attr('height', scale - 1)
      .attr('fill', "hsl(0,40%,70%)")
      .merge(rects)
      .attr('transform', (p) => `translate(${p.x * scale}, ${p.y * scale})`)
  }

  drawGrid() {
    // Draw the graph
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 40; y++) {
        this.gGrid.append('rect')
          .attr('transform', `translate(${x * scale}, ${y * scale})`)
          .attr('width', scale)
          .attr('height', scale)
          .attr('fill', "white")
          .attr('stroke', "gray");
      }
    }
  }

  makeScrubbableNumber(name, low, high, precision) {
    let diagram = this;
    let elements = diagram.root.selectAll(`[data-name='${name}']`);
    let positionToValue = d3.scaleLinear().clamp(true).domain([
      0, + 100
    ]).range([low, high]);

    function updateNumbers() {
      elements.text(() => {
        let format = `.${precision}f`;
        return d3.format(format)(diagram[name]);
      });
    }

    updateNumbers();

    elements.call(d3.drag().subject(() => ({
      x: positionToValue.invert(diagram[name]),
      y: 0
    })).on('drag', () => {
      diagram[name] = positionToValue(d3.event.x);
      updateNumbers();
      diagram.update();
    }));
  }
}

let diagram1 = new Diagram('demo');
let diagram2 = new Diagram('linear-interpolation');
