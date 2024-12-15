import { useState } from 'react';

const INITIAL_STATE = {
  mass1: {
    anchor: 50,
    restLength: 100,
    position: 150,
    velocity: 0,
    k: 0.1,
    externalForce: 0,
  },
  mass2: {
    anchor: 300,
    restLength: 100,
    position: 200,
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
    
    const leftDisplacement = (mass1.position - mass1.anchor) - mass1.restLength;
    const rightDisplacement = (mass2.position - mass2.anchor) + mass2.restLength;
    const couplingDisplacement = (mass2.position - mass1.position) - coupling.restLength;

    const leftSpringForce = -mass1.k * leftDisplacement;
    const rightSpringForce = -mass2.k * rightDisplacement;
    const couplingForce = -coupling.k * couplingDisplacement;
    
    const totalForce1 = leftSpringForce + (-couplingForce) + mass1.externalForce;
    const totalForce2 = rightSpringForce + couplingForce + mass2.externalForce;
    
    const newVelocity1 = (mass1.velocity + totalForce1) * damping;
    const newVelocity2 = (mass2.velocity + totalForce2) * damping;
    
    setSpringState(prev => ({
      ...prev,
      mass1: {
        ...prev.mass1,
        position: mass1.position + newVelocity1,
        velocity: newVelocity1,
      },
      mass2: {
        ...prev.mass2,
        position: mass2.position + newVelocity2,
        velocity: newVelocity2,
      },
    }));

    return {
      leftDisplacement,
      rightDisplacement,
    };
  };

  return {
    springState,
    setSpringState,
    updateSprings,
  };
};

