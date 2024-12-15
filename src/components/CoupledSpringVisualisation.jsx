import React, { useRef } from 'react';
import { generateSpringPath } from '../utils/springUtils';

const SpringVisualisation = ({ springState, handleMouseDown }) => {
  const svgRef = useRef(null);

  const EquilibriumLines = () => {
    const mass1Equilibrium = springState.mass1.anchor + springState.mass1.restLength;
    const mass2Equilibrium = springState.mass2.anchor - springState.mass2.restLength;
    return (
      <>
        <line 
          x1={mass1Equilibrium} 
          y1="20" 
          x2={mass1Equilibrium} 
          y2="80" 
          stroke="gray" 
          strokeWidth="1"
          strokeDasharray="4"
        />
        <line 
          x1={mass2Equilibrium} 
          y1="20" 
          x2={mass2Equilibrium} 
          y2="80" 
          stroke="gray" 
          strokeWidth="1"
          strokeDasharray="4"
        />
      </>
    );
  };

  return (
    <svg ref={svgRef} className="w-full" viewBox="0 0 400 100">
      {/* Wall anchors */}
      <line 
        x1={springState.mass1.anchor} 
        y1="20" 
        x2={springState.mass1.anchor} 
        y2="80" 
        stroke="black" 
        strokeWidth="4"
      />
      <line
        x1={springState.mass2.anchor}
        y1="20"
        x2={springState.mass2.anchor}
        y2="80"
        stroke="black"
        strokeWidth="4"
      />
      {/* Add other visualization elements */}

      {/* Equilibrium position markers */}
      {EquilibriumLines()}

      {/* Springs */}
      <path
        d={generateSpringPath(springState.mass1.anchor, springState.mass1.position)}
        fill="none"
        stroke="blue"
        strokeWidth="2"
      />
      <path
        d={generateSpringPath(springState.mass1.position, springState.mass2.position)}
        fill="none"
        stroke="purple"
        strokeWidth="2"
      />
      <path
        d={generateSpringPath(springState.mass2.position, springState.mass2.anchor)}
        fill="none"
        stroke="red"
        strokeWidth="2"
      />

      {/* Masses */}
      <circle
        cx={springState.mass1.position}
        cy="50"
        r="8"
        className="fill-blue-600 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleMouseDown(1, e)}
      />
      <circle
        cx={springState.mass2.position}
        cy="50"
        r="8"
        className="fill-red-600 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleMouseDown(2, e)}
      />
    </svg>
  );
};

export default SpringVisualisation;
