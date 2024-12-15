import React, { useEffect } from 'react';
import { useSpringPhysics } from '../hooks/useSpringPhysics';
import { usePositionHistory } from '../hooks/usePositionHistory';
import SpringVisualisation from './CoupledSpringVisualisation';
import SpringControls from './CoupledSpringControls';
import PrintDisplacement from './PrintDisplacement';
import DisplacementGraph from './DisplacementGraph';

const CoupledSpring = () => {
  const { springState, setSpringState, updateSprings } = useSpringPhysics();
  const maxDataPoints = 200;
  const { positionHistory, updateHistory } = usePositionHistory(maxDataPoints);

  useEffect(() => {
    const timer = setInterval(() => {
      const { leftDisplacement, rightDisplacement } = updateSprings();
      updateHistory(leftDisplacement, rightDisplacement);
    }, 16);
    return () => clearInterval(timer);
  }, [springState]);


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

          <PrintDisplacement 
            springState={springState} 
          />

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
