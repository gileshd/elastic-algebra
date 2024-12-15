import { useState } from 'react';

export const usePositionHistory = (maxDataPoints = 200) => {
  const [positionHistory, setPositionHistory] = useState([]);
  const [time, setTime] = useState(0);

  const updateHistory = (leftDisplacement, rightDisplacement) => {
    setTime(prevTime => prevTime + 1);
    setPositionHistory(prev => {
      const newPoint = {
        time: time + 1,
        position1: leftDisplacement,
        position2: rightDisplacement,
      };
      return [...prev, newPoint].slice(-maxDataPoints);
    });
  };

  return {
    positionHistory,
    time,
    updateHistory,
  };
};
