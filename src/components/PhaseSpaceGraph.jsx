import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PhaseSpaceGraph = ({ positionHistory }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (positionHistory.length > 0) {
      const svg = d3.select(graphRef.current);
      const width = 200;
      const height = 200;
      const margin = { top: 20, right: 20, bottom: 40, left: 40 };

      svg.selectAll("*").remove();

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([-30, 30])
        .range([margin.left, width - margin.right]);

      const yScale = d3.scaleLinear()
        .domain([-30, 30])
        .range([height - margin.bottom, margin.top]);

      // Add axes with smaller font
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .style("font-size", "5px");

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .style("font-size", "5px");

      // Add axis labels with smaller font
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "6px")
        .text("Mass 1 Position");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-size", "6px")
        .text("Mass 2 Position");

      // Plot the phase space trajectory
      const line = d3.line()
        .x(d => xScale(d.position1))
        .y(d => yScale(d.position2));

      svg.append("path")
        .datum(positionHistory)
        .attr("fill", "none")
        .attr("stroke", "purple")
        .attr("stroke-width", 1.)
        .attr("opacity", 0.5)
        .style("mix-blend-mode", "multiply")
        .attr("d", line);

      // Add the current point
      const currentPoint = positionHistory[positionHistory.length - 1];
      svg.append("circle")
        .attr("cx", xScale(currentPoint.position1))
        .attr("cy", yScale(currentPoint.position2))
        .attr("r", 2)
        .attr("fill", "red");
    }
  }, [positionHistory]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Phase Space Plot</h3>
      <svg
        ref={graphRef}
        className="w-full"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default PhaseSpaceGraph; 
