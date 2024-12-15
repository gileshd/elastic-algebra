import React, { useEffect, useState } from 'react';
import DisplacementGraph from './DisplacementGraph';
import SpringControls from './CoupledSpringControls';
import SpringVisualisation from './CoupledSpringVisualisation';
import { formatDisplacement } from '../utils/springUtils';
import * as d3 from 'd3';

const CoupledSpring = () => {

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
g         y1="20" 
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
            <SpringVisualisation
              springState={springState}
              handleMouseDown={handleMouseDown}
            />
            <SpringControls
              springState={springState}
              setSpringState={setSpringState}
            />
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
