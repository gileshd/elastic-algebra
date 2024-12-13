import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Spring = () => {
  const svgRef = useRef(null);
  const graphRef = useRef(null);
  const [springState, setSpringState] = useState({
    restLength: 100,
    currentLength: 100,
    k: 0.1,
    damping: 0.98,
    velocity: 0,
    externalForce: 0
  });
  
  const [positionHistory, setPositionHistory] = useState([]);
  const [time, setTime] = useState(0);
  const maxDataPoints = 200;

  useEffect(() => {
    const updateSpring = () => {
      // Spring force + external force
      const springForce = -springState.k * (springState.currentLength - springState.restLength);
      const totalForce = springForce + springState.externalForce;
      
      const newVelocity = springState.velocity + totalForce;
      const dampedVelocity = newVelocity * springState.damping;
      const newLength = springState.currentLength + dampedVelocity;
    
      setSpringState(prev => ({
        ...prev,
        currentLength: newLength,
        velocity: dampedVelocity
      }));

      setTime(prevTime => prevTime + 1);

      setPositionHistory(prev => {
        const newPoint = {
          time: time + 1,
          position: newLength - springState.restLength
        };
        const updatedHistory = [...prev, newPoint].slice(-maxDataPoints);
        return updatedHistory;
      });
    };

    const timer = setInterval(updateSpring, 16);
    return () => clearInterval(timer);
  }, [springState, time]);

  useEffect(() => {
    if (positionHistory.length > 0) {
      const svg = d3.select(graphRef.current);
      const width = 400;
      const height = 150;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      
      svg.selectAll("*").remove();
      
      const currentTime = positionHistory[positionHistory.length - 1].time;
      
      const xScale = d3.scaleLinear()
        .domain([currentTime - maxDataPoints, currentTime])
        .range([margin.left, width - margin.right]);

      const yScale = d3.scaleLinear()
        .domain([-50, 50])
        .range([height - margin.bottom, margin.top]);

      const line = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.position));

      const xAxis = d3.axisBottom(xScale).tickSize(0).tickFormat("");
      const yAxis = d3.axisLeft(yScale).tickSize(0).tickFormat("");

      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

      // Draw line
      svg.append("path")
        .datum(positionHistory)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

      // Add labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 5)
        .attr("text-anchor", "middle")
        .text("Time");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .text("Displacement");
    }
  }, [positionHistory]);

  // Generate spring path
  const generateSpringPath = () => {
    const coils = 10;
    const coilWidth = 20;
    const path = d3.path();
    
    path.moveTo(50, 50);
    
    for (let i = 0; i <= coils; i++) {
      const x = 50 + (i / coils) * springState.currentLength;
      const y = 50 + Math.sin(i * Math.PI) * coilWidth;
      path.lineTo(x, y);
    }
    
    path.lineTo(50 + springState.currentLength, 50);
    return path.toString();
  };

  // Handle mouse interaction
  const handleMouseDown = (e) => {
    const startX = e.clientX;
    const startLength = springState.currentLength;
    
    const handleMouseMove = (e) => {
      const dx = Math.min(50, e.clientX - startX); // limit the movement to 50px
      setSpringState(prev => ({
        ...prev,
        currentLength: Math.max(50, startLength + dx),
        velocity: 0
      }));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Interactive Spring</h2>
        <div className="border rounded p-4">
          {/* Spring and controls container */}
          <div className="flex gap-6">
            {/* Spring visualization container */}
            <div className="flex-1">
              <svg
                ref={svgRef}
                className="w-full"
                viewBox="0 0 400 100"
                onMouseDown={handleMouseDown}
              >
                <circle cx="50" cy="50" r="5" className="fill-blue-600" />
                <path
                  d={generateSpringPath()}
                  fill="none"
                  stroke="blue"
                  strokeWidth="3"
                  className="cursor-pointer"
                />
                <circle
                  cx={50 + springState.currentLength}
                  cy="50"
                  r="8"
                  className="fill-blue-600 cursor-grab active:cursor-grabbing"
                />
                <line
                  x1={50 + springState.restLength}
                  y1="20"
                  x2={50 + springState.restLength}
                  y2="80"
                  stroke="gray"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
              </svg>
            </div>

            {/* Controls container */}
            <div className="w-64 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spring Constant (k): {springState.k.toFixed(3)}
                </label>
                <input 
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={springState.k}
                  onChange={(e) => setSpringState(prev => ({
                    ...prev,
                    k: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Damping Factor: {springState.damping.toFixed(3)}
                </label>
                <input 
                  type="range"
                  min="0.9"
                  max="0.999"
                  step="0.001"
                  value={springState.damping}
                  onChange={(e) => setSpringState(prev => ({
                    ...prev,
                    damping: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Force: {springState.externalForce.toFixed(1)}
                </label>
                <input 
                  type="range"
                  min="-3.0"
                  max="3.0"
                  step="0.1"
                  value={springState.externalForce}
                  onChange={(e) => setSpringState(prev => ({
                    ...prev,
                    externalForce: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Position graph */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Displacement vs Time</h3>
            <svg
              ref={graphRef}
              className="w-full"
              viewBox="0 0 400 150"
              preserveAspectRatio="xMidYMid meet"
            />
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Spring Length: {Math.round(springState.currentLength)}px
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spring;
