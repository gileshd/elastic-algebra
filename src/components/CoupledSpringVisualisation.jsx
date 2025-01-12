import React, { useRef } from 'react';
import { generateSpringPath } from '../utils/springUtils';

const VISUAL_CONFIG = {
  mass1Anchor: 50,
  mass2Anchor: 300,
  mass1RestLength: 100,
  mass2RestLength: 100,
};

export const convertToVisualCoords = (massIndex, displacement) => { if (massIndex === 1) {
    return VISUAL_CONFIG.mass1Anchor + VISUAL_CONFIG.mass1RestLength + displacement;
  }
  return VISUAL_CONFIG.mass2Anchor - VISUAL_CONFIG.mass2RestLength + displacement;
};

export const convertToPhysicsCoords = (massIndex, visualPosition) => {
  if (massIndex === 1) {
    return visualPosition - (VISUAL_CONFIG.mass1Anchor + VISUAL_CONFIG.mass1RestLength);
  }
  return visualPosition - (VISUAL_CONFIG.mass2Anchor - VISUAL_CONFIG.mass2RestLength);
};

const EquilibriumLines = ({ visualConfig }) => {
  const mass1Equilibrium = visualConfig.mass1Anchor + visualConfig.mass1RestLength;
  const mass2Equilibrium = visualConfig.mass2Anchor - visualConfig.mass2RestLength;
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

const SpringVisualisation = ({ springState, handleMouseDown }) => {
  const svgRef = useRef(null);

  return (
    <svg ref={svgRef} className="w-full" viewBox="0 0 400 100">
      {/* Wall anchors */}
      <line 
        x1={VISUAL_CONFIG.mass1Anchor} 
        y1="20" 
        x2={VISUAL_CONFIG.mass1Anchor} 
        y2="80" 
        stroke="black" 
        strokeWidth="4"
      />
      <line
        x1={VISUAL_CONFIG.mass2Anchor}
        y1="20"
        x2={VISUAL_CONFIG.mass2Anchor}
        y2="80"
        stroke="black"
        strokeWidth="4"
      />

      {/* Equilibrium position markers */}
      <EquilibriumLines visualConfig={VISUAL_CONFIG} />

      {/* Springs */}
      <path
        d={generateSpringPath(
          VISUAL_CONFIG.mass1Anchor,
          convertToVisualCoords(1, springState.mass1.displacement)
        )}
        fill="none"
        stroke="blue"
        strokeWidth="2"
      />
      <path
        d={generateSpringPath(
          convertToVisualCoords(1, springState.mass1.displacement),
          convertToVisualCoords(2, springState.mass2.displacement)
        )}
        fill="none"
        stroke="purple"
        strokeWidth="2"
      />
      <path
        d={generateSpringPath(
          convertToVisualCoords(2, springState.mass2.displacement),
          VISUAL_CONFIG.mass2Anchor
        )}
        fill="none"
        stroke="red"
        strokeWidth="2"
      />

      {/* Masses */}
      <circle
        cx={convertToVisualCoords(1, springState.mass1.displacement)}
        cy="50"
        r="8"
        className="fill-blue-600 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleMouseDown(1, e, convertToPhysicsCoords)}
      />
      <circle
        cx={convertToVisualCoords(2, springState.mass2.displacement)}
        cy="50"
        r="8"
        className="fill-red-600 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleMouseDown(2, e, convertToPhysicsCoords)}
      />
    </svg>
  );
};

export default SpringVisualisation;
