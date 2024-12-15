import React from 'react';

const SpringControls = ({ springState, setSpringState }) => {
  return (
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
      {/* Add other controls similarly */}
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

      {/* External Force Controls */}
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
  );
};

export default SpringControls;
