import { useState } from 'react';

// Physical constants
const KB = 1; // Boltzmann constant
const DEFAULT_TEMP = 0.5; // Temperature in Kelvin

// System parameters matching original interface
const INITIAL_STATE = {
  mass1: {
    displacement: 0,
    momentum: 0,
    k: 1.0,
    externalForce: 0,
  },
  mass2: {
    displacement: 0,
    momentum: 0,
    k: 1.0,
    externalForce: 0,
  },
  coupling: {
    k: 0.5,
    restLength: 50,
  },
  // Additional Langevin parameters
  mass: 1.0,          // M in the paper
  gamma: 0.1,         // γ (damping coefficient)
  temperature: DEFAULT_TEMP,
};

// Helper function for Gaussian random numbers
const gaussianRandom = () => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
};

export const useSpringPhysics = () => {
  const [springState, setSpringState] = useState(INITIAL_STATE);
  
  // Constructs the A matrix from spring constants
  const constructAMatrix = () => {
    const { mass1, mass2, coupling } = springState;
    return [
      [mass1.k + coupling.k, -coupling.k],
      [-coupling.k, mass2.k + coupling.k]
    ];
  };
  
  // Compute forces from positions (Ax - b term)
  const computeForces = (positions) => {
    const A = constructAMatrix();
    const externalForces = [springState.mass1.externalForce, springState.mass2.externalForce];
    
    const forces = positions.map((_, i) => {
      let force = 0;
      for(let j = 0; j < positions.length; j++) {
        force += A[i][j] * positions[j];
      }
      force -= externalForces[i];
      return force;
    });
    return forces;
  };

  const updateSprings = (dt = 1) => {
    const { mass1, mass2, mass, gamma, temperature } = springState;

    // Get current state vectors
    const positions = [mass1.displacement, mass2.displacement];
    const momenta = [mass1.momentum, mass2.momentum];

    // Calculate noise strength from fluctuation-dissipation theorem
    const noiseStrength = Math.sqrt(2 * gamma * KB * temperature / dt);

    // Update positions according to Eq. B3: dx = (1/M)p dt
    const newPositions = positions.map((x, i) => 
      x + (momenta[i] / mass) * dt
    );

    // Calculate forces (Ax - b term)
    const forces = computeForces(newPositions);

    // Update momenta according to Eq. B4:
    // dp = -(Ax - b)dt - (γ/M)p dt + √(2γkBT)dW
    const newMomenta = momenta.map((p, i) => {
      const drift = -forces[i];
      const damping = -(gamma / mass) * p;
      const noise = noiseStrength * gaussianRandom();
      return p + (drift + damping) * dt + noise;
    });

    // Update state while maintaining original interface
    setSpringState(prev => ({
      ...prev,
      mass1: {
        ...prev.mass1,
        displacement: newPositions[0],
        momentum: newMomenta[0],
      },
      mass2: {
        ...prev.mass2,
        displacement: newPositions[1],
        momentum: newMomenta[1],
      },
    }));

    // Return displacements in the format expected by the original interface
    return {
      leftDisplacement: newPositions[0],
      rightDisplacement: newPositions[1],
    };
  };

  return {
    springState,
    setSpringState,
    updateSprings,
  };
};
