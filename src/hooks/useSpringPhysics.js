import { useState } from 'react';

const INITIAL_STATE = {
  mass1: {
    displacement: 0,
    velocity: 0,
    k: 0.1,
    externalForce: 0,
  },
  mass2: {
    displacement: 0,
    velocity: 0,
    k: 0.1,
    externalForce: 0,
  },
  coupling: {
    k: 0.05,
    restLength: 50,
  },
  damping: 0.98,
};

export const useSpringPhysics = () => {
  const [springState, setSpringState] = useState(INITIAL_STATE);

  const updateSprings = () => {
    const { mass1, mass2, coupling, damping } = springState;
    
    // Forces are now directly proportional to displacements
    const leftSpringForce = -mass1.k * mass1.displacement;
    const rightSpringForce = -mass2.k * mass2.displacement;
    const couplingForce = -coupling.k * (mass2.displacement - mass1.displacement);
    
    const totalForce1 = leftSpringForce + (-couplingForce) + mass1.externalForce;
    const totalForce2 = rightSpringForce + couplingForce + mass2.externalForce;
    
    const newVelocity1 = (mass1.velocity + totalForce1) * damping;
    const newVelocity2 = (mass2.velocity + totalForce2) * damping;
    
    setSpringState(prev => ({
      ...prev,
      mass1: {
        ...prev.mass1,
        displacement: mass1.displacement + newVelocity1,
        velocity: newVelocity1,
      },
      mass2: {
        ...prev.mass2,
        displacement: mass2.displacement + newVelocity2,
        velocity: newVelocity2,
      },
    }));

    return {
      leftDisplacement: mass1.displacement,
      rightDisplacement: mass2.displacement,
    };
  };

  return {
    springState,
    setSpringState,
    updateSprings,
  };
};

