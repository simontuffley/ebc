// code from Micah Stubbs
//  https://github.com/micahstubbs/d3-adjacency-matrix-layout
//  MIT license

import {scaleLinear, scalePoint} from 'd3-scale'
import {axisTop, axisLeft} from 'd3-axis'

export default function () {
  let directed = true;
  let size = [1, 1];
  let nodes = [];
  let edges = [];
  let edgeWeight = d => 1;
  let nodeID = d => d.id;

  function matrix() {
    const width = size[0];
    const height = size[1];
    const nodeWidth = width / nodes.length;
    const nodeHeight = height / nodes.length;
    // const constructedMatrix = [];
    const matrix = [];
    const edgeHash = {};
    const xScale = scaleLinear()
      .domain([0, nodes.length])
      .range([0, width]);

    const yScale = scaleLinear()
      .domain([0, nodes.length])
      .range([0, height]);

    nodes.forEach((node, i) => {
      node.sortedIndex = i;
    });

    edges.forEach(edge => {
      const constructedEdge = {
        source: edge.source,
        target: edge.target,
        weight: edgeWeight(edge)
      };
      if (typeof edge.source === 'number') {
        constructedEdge.source = nodes[edge.source];
      }
      if (typeof edge.target === 'number') {
        constructedEdge.target = nodes[edge.target];
      }
      let id = `${nodeID(constructedEdge.source)}-${nodeID(constructedEdge.target)}`;

      if (directed === false &&
        constructedEdge.source.sortedIndex < constructedEdge.target.sortedIndex) {
        id = `${nodeID(constructedEdge.target)}-${nodeID(constructedEdge.source)}`;
      }
      if (!edgeHash[id]) {
        edgeHash[id] = constructedEdge;
      } else {
        edgeHash[id].weight = edgeHash[id].weight + constructedEdge.weight;
      }
    });

    nodes.forEach((sourceNode, a) => {
      nodes.forEach((targetNode, b) => {
        const grid = {
          id: `${nodeID(sourceNode)}-${nodeID(targetNode)}`,
          source: sourceNode,
          target: targetNode,
          x: xScale(b),
          y: yScale(a),
          weight: 0,
          height: nodeHeight,
          width: nodeWidth
        };
        let edgeWeight = 0;
        if (edgeHash[grid.id]) {
          edgeWeight = edgeHash[grid.id].weight;
          grid.weight = edgeWeight;
        }
        if (directed === true || b < a) {
          matrix.push(grid);
          if (directed === false) {
            const mirrorGrid = {
              id: `${nodeID(sourceNode)}-${nodeID(targetNode)}`,
              source: sourceNode,
              target: targetNode,
              x: xScale(a),
              y: yScale(b),
              weight: 0,
              height: nodeHeight,
              width: nodeWidth
            };
            mirrorGrid.weight = edgeWeight;
            matrix.push(mirrorGrid);
          }
        }
      });
    });

    console.log('matrix', matrix, matrix.length);

    return matrix;
  }

  matrix.directed = function (x) {
    if (!arguments.length) return directed;
    directed = x;
    return matrix;
  };

  matrix.size = function (x) {
    if (!arguments.length) return size;
    size = x;
    return matrix;
  };

  matrix.nodes = function (x) {
    if (!arguments.length) return nodes;
    nodes = x;
    return matrix;
  };

  matrix.links = function (x) {
    if (!arguments.length) return edges;
    edges = x;
    return matrix;
  };

  matrix.edgeWeight = function (x) {
    if (!arguments.length) return edgeWeight;
    if (typeof x === 'function') {
      edgeWeight = x;
    } else {
      edgeWeight = () => x;
    }
    return matrix;
  };

  matrix.nodeID = function (x) {
    if (!arguments.length) return nodeID;
    if (typeof x === 'function') {
      nodeID = x;
    }
    return matrix;
  };

  matrix.xAxis = calledG => {
    const nameScale = scalePoint()
      .domain(nodes.map(nodeID))
      .range([0, size[0]])
      .padding(1);

    const xAxis = axisTop()
      .scale(nameScale)
      .tickSize(4);

    calledG
      .append('g')
      .attr('class', 'am-xAxis am-axis')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('transform', 'translate(-10,-10) rotate(90)');
  };

  matrix.yAxis = calledG => {
    const nameScale = scalePoint()
      .domain(nodes.map(nodeID))
      .range([0, size[1]])
      .padding(1);

    const yAxis = axisLeft()
      .scale(nameScale)
      .tickSize(4);

    calledG.append('g')
      .attr('class', 'am-yAxis am-axis')
      .call(yAxis);
  };

  return matrix;
}