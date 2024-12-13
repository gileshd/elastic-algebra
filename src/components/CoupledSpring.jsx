import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const CoupledSpring = () => {
  const svgRef = useRef(null);
  const graphRef = useRef(null);
  const [springState, setSpringState] = useState({
    // Mass 1 properties
    mass1: {
      position: 100,
      velocity: 0,
      k: 0.1, // spring constant for left spring
    },
    // Mass 2 properties
    mass2: {
      position: 200,
      velocity: 0,
      k: 0.1, // spring constant for right spring
    },
    // Coupling spring properties
    coupling: {
      k: 0.05, // coupling spring constant
      naturalLength: 50, // natural length between masses
    },
    // Global properties
    damping: 0.98,
    leftAnchor: 50, // x-position of left wall anchor
    rightAnchor: 300, // x-position of right wall anchor
  });

  const [positionHistory, setPositionHistory] = useState([]);
  const [time, setTime] = useState(0);
  const maxDataPoints = 200;

  useEffect(() => {
    const updateSprings = () => {
      const {mass1, mass2, coupling, damping, leftAnchor, rightAnchor} = springState;
      
      // Calculate forces on mass 1
      const leftSpringForce = -mass1.k * (mass1.position - leftAnchor);
      const couplingForce1 = -coupling.k * 
        ((mass1.position - mass2.position) - coupling.naturalLength);
      
      // Calculate forces on mass 2
      const rightSpringForce = -mass2.k * (mass2.position - rightAnchor);
      const couplingForce2 = coupling.k * 
        ((mass1.position - mass2.position) - coupling.naturalLength);
      
      // Update velocities and positions
      const newVelocity1 = (mass1.velocity + leftSpringForce + couplingForce1) * damping;
      const newPosition1 = mass1.position + newVelocity1;
      
      const newVelocity2 = (mass2.velocity + rightSpringForce + couplingForce2) * damping;
      const newPosition2 = mass2.position + newVelocity2;

      setSpringState(prev => ({
        ...prev,
        mass1: {
          ...prev.mass1,
          position: newPosition1,
          velocity: newVelocity1,
        },
        mass2: {
          ...prev.mass2,
          position: newPosition2,
          velocity: newVelocity2,
        },
      }));

      setTime(prevTime => prevTime + 1);
      
      setPositionHistory(prev => {
        const newPoint = {
          time: time + 1,
          position1: newPosition1 - leftAnchor,
          position2: newPosition2 - leftAnchor,
        };
        return [...prev, newPoint].slice(-maxDataPoints);
      });
    };

    const timer = setInterval(updateSprings, 16);
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
        .domain([-100, 300])
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

  const generateSpringPath = (x1, x2) => {
    const coils = 5;
    const coilWidth = 10;
    const path = d3.path();
    
    path.moveTo(x1, 50);
    
    for (let i = 0; i <= coils; i++) {
      const x = x1 + (i / coils) * (x2 - x1);
      const y = 50 + Math.sin(i * Math.PI) * coilWidth;
      path.lineTo(x, y);
    }
    
    path.lineTo(x2, 50);
    return path.toString();
  };

  const handleMouseDown = (massIndex, e) => {
    const startX = e.clientX;
    const startPos = massIndex === 1 ? springState.mass1.position : springState.mass2.position;
    
    const handleMouseMove = (e) => {
      const dx = e.clientX - startX;
      const newPos = Math.max(springState.leftAnchor + 20, 
        Math.min(springState.rightAnchor - 20, startPos + dx));
      
      setSpringState(prev => ({
        ...prev,
        [massIndex === 1 ? 'mass1' : 'mass2']: {
          ...prev[massIndex === 1 ? 'mass1' : 'mass2'],
          position: newPos,
          velocity: 0
        }
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
        <h2 className="text-xl font-bold mb-4">Coupled Spring System</h2>
        <div className="border rounded p-4">
          <div className="flex gap-6">
            <div className="flex-1">
              <svg
                ref={svgRef}
                className="w-full"
                viewBox="0 0 400 100"
              >
                {/* Left wall anchor */}
                <line 
                  x1={springState.leftAnchor} 
                  y1="20" 
                  x2={springState.leftAnchor} 
                  y2="80" 
                  stroke="black" 
                  strokeWidth="4"
                />
                
                {/* Right wall anchor */}
                <line 
                  x1={springState.rightAnchor} 
                  y1="20" 
                  x2={springState.rightAnchor} 
                  y2="80" 
                  stroke="black" 
                  strokeWidth="4"
                />
                
                {/* Left spring */}
                <path
                  d={generateSpringPath(springState.leftAnchor, springState.mass1.position)}
                  fill="none"
                  stroke="blue"
                  strokeWidth="2"
                />
                
                {/* Coupling spring */}
                <path
                  d={generateSpringPath(springState.mass1.position, springState.mass2.position)}
                  fill="none"
                  stroke="purple"
                  strokeWidth="2"
                />
                
                {/* Right spring */}
                <path
                  d={generateSpringPath(springState.mass2.position, springState.rightAnchor)}
                  fill="none"
                  stroke="red"
                  strokeWidth="2"
                />
                
                {/* Mass 1 */}
                <circle
                  cx={springState.mass1.position}
                  cy="50"
                  r="8"
                  className="fill-blue-600 cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleMouseDown(1, e)}
                />
                
                {/* Mass 2 */}
                <circle
                  cx={springState.mass2.position}
                  cy="50"
                  r="8"
                  className="fill-red-600 cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleMouseDown(2, e)}
                />
              </svg>
            </div>

            <div className="w-64 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Left Spring Constant: {springState.mass1.k.toFixed(3)}
                </label>
                <input 
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={springState.mass1.k}
                  onChange={(e) => setSpringState(prev => ({
                    ...prev,
                    mass1: { ...prev.mass1, k: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Right Spring Constant: {springState.mass2.k.toFixed(3)}
                </label>
                <input 
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={springState.mass2.k}
                  onChange={(e) => setSpringState(prev => ({
                    ...prev,
                    mass2: { ...prev.mass2, k: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupling Spring Constant: {springState.coupling.k.toFixed(3)}
                </label>
                <input 
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={springState.coupling.k}
                  onChange={(e) => setSpringState(prev => ({
                    ...prev,
                    coupling: { ...prev.coupling, k: parseFloat(e.target.value) }
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
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Displacement vs Time</h3>
            <svg
              ref={graphRef}
              className="w-full"
              viewBox="0 0 400 150"
              preserveAspectRatio="xMidYMid meet"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoupledSpring;
