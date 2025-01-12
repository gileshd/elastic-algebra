import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DisplacementGraph = ({ positionHistory, maxDataPoints }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (positionHistory.length > 0) {
      const svg = d3.select(graphRef.current);
      const width = 400;
      const height = 150;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      
      svg.selectAll("*").remove();

      positionHistory = positionHistory.slice(-maxDataPoints)
      
      const currentTime = positionHistory[positionHistory.length - 1].time;
      
      const xScale = d3.scaleLinear()
        .domain([currentTime - maxDataPoints, currentTime])
        .range([margin.left, width - margin.right]);

      const yScale = d3.scaleLinear()
        .domain([-100, 100])
        .range([height - margin.bottom, margin.top]);

      const line1 = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.position1));

      const line2 = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.position2));

      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSize(0).tickFormat(""));

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).tickSize(0).tickFormat(""));

      // Draw lines for both masses
      svg.append("path")
        .datum(positionHistory)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("d", line1);

      svg.append("path")
        .datum(positionHistory)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", line2);

      // Add legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 100},${margin.top})`);

      legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 4).style("fill", "blue");
      legend.append("text").attr("x", 10).attr("y", 4).text("Mass 1").style("font-size", "10px");
      legend.append("circle").attr("cx", 0).attr("cy", 15).attr("r", 4).style("fill", "red");
      legend.append("text").attr("x", 10).attr("y", 19).text("Mass 2").style("font-size", "10px");
    }
  }, [positionHistory]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Displacement vs Time</h3>
      <svg
        ref={graphRef}
        className="w-full"
        viewBox="0 0 400 150"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default DisplacementGraph;
