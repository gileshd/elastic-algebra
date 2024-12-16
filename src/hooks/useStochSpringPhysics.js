import { useState } from 'react';

// Added noise parameters - kept simple!
const NOISE_STRENGTH = 0.1;
const DT = 1;

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
    
    // Forces are now directly proportional to displacements
    const leftSpringForce = -mass1.k * mass1.displacement;
    const rightSpringForce = -mass2.k * mass2.displacement;
    const couplingForce = -coupling.k * (mass2.displacement - mass1.displacement);
    
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
        displacement: mass1.displacement + newVelocity1 * DT,
        velocity: newVelocity1,
      },
      mass2: {
        ...prev.mass2,
        displacement: mass2.displacement + newVelocity2 * DT,
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
