import { useState } from 'react';

// Added noise parameters - kept simple!
const NOISE_STRENGTH = 0.1;
const DT = 1;

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

// Simple Gaussian noise generator
const gaussianNoise = () => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
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
    
    // Add noise to the forces
    const noise1 = gaussianNoise() * NOISE_STRENGTH;
    const noise2 = gaussianNoise() * NOISE_STRENGTH;
    
    // Update velocities with forces + noise
    const newVelocity1 = (mass1.velocity + totalForce1 + noise1) * damping;
    const newVelocity2 = (mass2.velocity + totalForce2 + noise2) * damping;
    
    setSpringState(prev => ({
      ...prev,
      mass1: {
        ...prev.mass1,
        position: mass1.position + newVelocity1 * DT,
        velocity: newVelocity1,
      },
      mass2: {
        ...prev.mass2,
        position: mass2.position + newVelocity2 * DT,
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
