import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GroupedBoxPlot = ({ data, selectedMetric, clickedPoint }) => {
  const ref = useRef();
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };
  const width = 800;
  const height = 400;

  useEffect(() => {
    if (!data?.features || !clickedPoint?.geometry) return;

    // Filter data for clicked location
    const filteredFeatures = data.features.filter(feature => 
      feature.geometry?.coordinates[0] === clickedPoint.geometry.coordinates[0] &&
      feature.geometry?.coordinates[1] === clickedPoint.geometry.coordinates[1]
    );

    // Process filtered data
    const processedData = filteredFeatures
      .map(f => f.properties)
      .sort((a, b) => d3.ascending(a.date, b.date));

    // Create D3 visualization
    const svg = d3.select(ref.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('border', '1px solid #eee');

    svg.selectAll('*').remove();

    // Create scales
    const x = d3.scaleBand()
      .domain(processedData.map(d => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const allMins = processedData.map(d => d[selectedMetric].min);
    const allMaxs = processedData.map(d => d[selectedMetric].max);
    const yMin = Math.min(...allMins);
    const yMax = Math.max(...allMaxs);
    const padding = (yMax - yMin) * 0.05;
    
    const y = d3.scaleLinear()
      .domain([yMin - padding, yMax + padding])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create boxes
    const dateGroups = svg.selectAll('.date-group')
      .data(processedData)
      .join('g')
      .attr('transform', d => `translate(${x(d.date)},0)`);

    dateGroups.each(function(d) {
      const group = d3.select(this);
      const boxData = d[selectedMetric];
      const boxWidth = x.bandwidth();

      // Box rectangle
      group.append('rect')
        .attr('x', 0)
        .attr('y', y(boxData.q3))
        .attr('width', boxWidth)
        .attr('height', y(boxData.q1) - y(boxData.q3))
        .attr('fill', '#2ECC71')
        .attr('opacity', 0.7);

      // Median line
      group.append('line')
        .attr('x1', 0)
        .attr('x2', boxWidth)
        .attr('y1', y(boxData.median))
        .attr('y2', y(boxData.median))
        .attr('stroke', 'black');

      // Whiskers
      group.append('line')
        .attr('x1', boxWidth/2)
        .attr('x2', boxWidth/2)
        .attr('y1', y(boxData.min))
        .attr('y2', y(boxData.max))
        .attr('stroke', 'black');

      // Whisker caps
      group.append('line')
        .attr('x1', 0)
        .attr('x2', boxWidth)
        .attr('y1', y(boxData.min))
        .attr('y2', y(boxData.min))
        .attr('stroke', 'black');

      group.append('line')
        .attr('x1', 0)
        .attr('x2', boxWidth)
        .attr('y1', y(boxData.max))
        .attr('y2', y(boxData.max))
        .attr('stroke', 'black');
    });

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

  }, [data, selectedMetric, clickedPoint]); // Add all dependencies

  return <svg ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export default GroupedBoxPlot;