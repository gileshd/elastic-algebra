import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Spring = () => {
  const svgRef = useRef(null);
  const [springState, setSpringState] = useState({
    restLength: 100,
    currentLength: 100,
    k: 0.1, // spring constant
    damping: 0.98,
    velocity: 0
  });

  // Initialize the visualization
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    // Create gradient for metallic spring look
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "metallic")
      .attr("x1", "0%")
      .attr("x2", "100%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:#a0a0a0;stop-opacity:1");
      
    gradient.append("stop")
      .attr("offset", "50%")
      .attr("style", "stop-color:#f0f0f0;stop-opacity:1");
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:#a0a0a0;stop-opacity:1");
  }, []);

  // Update spring physics
  useEffect(() => {
    const updateSpring = () => {
      const force = -springState.k * (springState.currentLength - springState.restLength);
      const newVelocity = springState.velocity + force;
      const dampedVelocity = newVelocity * springState.damping;
      const newLength = springState.currentLength + dampedVelocity;

      setSpringState(prev => ({
        ...prev,
        currentLength: newLength,
        velocity: dampedVelocity
      }));
    };

    const timer = setInterval(updateSpring, 16); // ~60fps
    return () => clearInterval(timer);
  }, [springState]);

  // Generate spring path
  const generateSpringPath = () => {
    const coils = 10;
    const coilWidth = 20;
    const path = d3.path();
    
    path.moveTo(50, 50);
    
    // Create coils
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
    const svg = svgRef.current;
    const startX = e.clientX;
    const startLength = springState.currentLength;
    
    const handleMouseMove = (e) => {
      const dx = e.clientX - startX;
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
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Interactive Spring</h2>
        <div className="border rounded p-4">
          <svg
            ref={svgRef}
            className="w-full"
            viewBox="0 0 400 100"
            onMouseDown={handleMouseDown}
          >
            {/* Fixed point */}
            <circle cx="50" cy="50" r="5" className="fill-red-600" />
            
            {/* Spring */}
            <path
              d={generateSpringPath()}
              fill="none"
              // stroke="url(#metallic)"
              stroke="blue"
              strokeWidth="3"
              className="cursor-pointer"
            />
            
            {/* Moving end */}
            <circle
              cx={50 + springState.currentLength}
              cy="50"
              r="8"
              className="fill-blue-600 cursor-grab active:cursor-grabbing"
            />
          </svg>
          
          <div className="mt-4 text-sm text-gray-600">
            Spring Length: {Math.round(springState.currentLength)}px
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spring;
