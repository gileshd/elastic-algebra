import React, { useEffect, useRef, useState } from 'react';
import DisplacementGraph from './DisplacementGraph';
import { formatDisplacement } from '../utils/springUtils';
import * as d3 from 'd3';

const CoupledSpring = () => {
  const svgRef = useRef(null);

  const [springState, setSpringState] = useState({
    // Mass 1 properties
    mass1: {
      anchor: 50,
      restLength: 100,
      position: 150, // anchor + restLength at equilibrium
      velocity: 0,
      k: 0.1,
      externalForce: 0,
    },
    // Mass 2 properties
    mass2: {
      anchor: 300,
      restLength: 100,
      position: 200, // anchor - restLength at equilibrium
      velocity: 0,
      k: 0.1,
      externalForce: 0,
    },
    // Coupling spring properties
    coupling: {
      k: 0.05,
      restLength: 50, // natural length between masses at equilibrium
    },
    // Global properties
    damping: 0.98,
  });

  const [positionHistory, setPositionHistory] = useState([]);
  const [time, setTime] = useState(0);
  const maxDataPoints = 200;

  useEffect(() => {
      const updateSprings = () => {
      const {mass1, mass2, coupling, damping} = springState;
      
      // Calculate displacements from equilibrium
      const leftDisplacement = (mass1.position - mass1.anchor) - mass1.restLength;
      const rightDisplacement = (mass2.position - mass2.anchor) + mass2.restLength;
      const couplingDisplacement = (mass2.position - mass1.position) - coupling.restLength;

      // Calculate forces (negative because spring forces oppose displacement)
      const leftSpringForce = -mass1.k * leftDisplacement;
      const rightSpringForce = -mass2.k * rightDisplacement;
      
      // Coupling forces are equal and opposite
      const couplingForce = -coupling.k * couplingDisplacement;
      
      // Total forces include coupling forces
      const totalForce1 = leftSpringForce + (-couplingForce) + mass1.externalForce;
      const totalForce2 = rightSpringForce + couplingForce + mass2.externalForce;
      
      // Update velocities and positions
      const newVelocity1 = (mass1.velocity + totalForce1) * damping;
      const newPosition1 = mass1.position + newVelocity1;
      
      const newVelocity2 = (mass2.velocity + totalForce2) * damping;
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
          position1: leftDisplacement, // using the calculated displacement
          position2: rightDisplacement, // using the calculated displacement
        };
        return [...prev, newPoint].slice(-maxDataPoints);
      });
    };

    const timer = setInterval(updateSprings, 16);
    return () => clearInterval(timer);
  }, [springState, time]);

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
      const newPos = Math.max(springState.mass1.anchor + 20, 
        Math.min(springState.mass2.anchor - 20, startPos + dx));
      
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

  // Draw equilibrium positions
  const equilibriumPositions = () => {
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
                
                {/* Equilibrium position markers */}
                {equilibriumPositions()}
                
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
                  min="0.0"
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

              {/* New External Force Controls */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2">External Forces</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Force on Mass 1: {springState.mass1.externalForce.toFixed(1)}
                  </label>
                  <input 
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={springState.mass1.externalForce}
                    onChange={(e) => setSpringState(prev => ({
                      ...prev,
                      mass1: { 
                        ...prev.mass1, 
                        externalForce: parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Force on Mass 2: {springState.mass2.externalForce.toFixed(1)}
                  </label>
                  <input 
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={springState.mass2.externalForce}
                    onChange={(e) => setSpringState(prev => ({
                      ...prev,
                      mass2: { 
                        ...prev.mass2, 
                        externalForce: parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 space-y-1 font-mono">
            <div>
              Mass 1 displacement: 
              <span style={{ display: 'inline-block', width: '4ch' }}>
                {formatDisplacement((springState.mass1.position - springState.mass1.anchor) - springState.mass1.restLength)}
              </span>
            </div>
            <div>
              Mass 2 displacement: 
              <span style={{ display: 'inline-block', width: '4ch' }}>
                {formatDisplacement((springState.mass2.position - springState.mass2.anchor) + springState.mass2.restLength)}
              </span>
            </div>
          </div>
          
          <DisplacementGraph 
            positionHistory={positionHistory} 
            maxDataPoints={maxDataPoints}
          />
        </div>
      </div>
    </div>
  );
};

export default CoupledSpring;
