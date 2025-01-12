import React, { useEffect } from 'react';
import { useSpringPhysics } from '../hooks/useStochSpringPhysics';
import { usePositionHistory } from '../hooks/usePositionHistory';
import SpringVisualisation from './CoupledSpringVisualisation';
import SpringControls from './CoupledSpringControls';
import { PrintDisplacement, PrintAverageDisplacement, PrintCovarianceMatrix} from './PrintDisplacement';
import DisplacementGraph from './DisplacementGraph';
import PhaseSpaceGraph from './PhaseSpaceGraph';

const CoupledSpring = () => {
  const { springState, setSpringState, updateSprings } = useSpringPhysics();
  const maxDataPoints = 1000;
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
    const startDisplacement = massIndex === 1 
      ? springState.mass1.displacement 
      : springState.mass2.displacement;
    
    const handleMouseMove = (e) => {
      const dx = (e.clientX - startX) * 0.2;
      const newDisplacement = startDisplacement + dx

      setSpringState(prev => ({
        ...prev,
        [`mass${massIndex}`]: {
          ...prev[`mass${massIndex}`],
          displacement: newDisplacement,
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

          <PrintAverageDisplacement
            positionHistory={positionHistory}
          />

          <PrintCovarianceMatrix
            positionHistory={positionHistory}
          />

          <DisplacementGraph
            positionHistory={positionHistory}
            maxDataPoints={400}
          />
          <PhaseSpaceGraph
            positionHistory={positionHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default CoupledSpring;
