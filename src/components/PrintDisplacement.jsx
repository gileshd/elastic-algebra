import { formatDisplacement } from '../utils/springUtils';

export const PrintDisplacement = ({ springState }) => {

  return (
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
  );
}


export const PrintAverageDisplacement = ({ positionHistory }) => {
  // Calculate averages if position history exists and has data
  const averages = positionHistory.length > 0 
    ? {
        position1: positionHistory.reduce((sum, point) => sum + point.position1, 0) / positionHistory.length,
        position2: positionHistory.reduce((sum, point) => sum + point.position2, 0) / positionHistory.length
      }
    : { position1: 0, position2: 0 };

  return (
    <div className="mt-4 text-sm text-gray-600 space-y-1 font-mono">
      <div>
        Mass 1 average: 
        <span style={{ display: 'inline-block', width: '4ch' }}>
          {formatDisplacement(averages.position1)}
        </span>
      </div>
      <div>
        Mass 2 average: 
        <span style={{ display: 'inline-block', width: '4ch' }}>
          {formatDisplacement(averages.position2)}
        </span>
      </div>
    </div>
  );
};


export const PrintCovarianceMatrix = ({ positionHistory }) => {
  const covariance = positionHistory.length > 1 
    ? {
        // Calculate means first
        mean1: positionHistory.reduce((sum, pt) => sum + pt.position1, 0) / positionHistory.length,
        mean2: positionHistory.reduce((sum, pt) => sum + pt.position2, 0) / positionHistory.length,
        
        // Then calculate covariance matrix elements
        cov11: positionHistory.reduce((sum, pt) => 
          sum + (pt.position1 - positionHistory.reduce((s, p) => s + p.position1, 0) / positionHistory.length) ** 2, 
          0) / (positionHistory.length - 1),
        
        cov22: positionHistory.reduce((sum, pt) => 
          sum + (pt.position2 - positionHistory.reduce((s, p) => s + p.position2, 0) / positionHistory.length) ** 2, 
          0) / (positionHistory.length - 1),
        
        cov12: positionHistory.reduce((sum, pt) => 
          sum + (pt.position1 - positionHistory.reduce((s, p) => s + p.position1, 0) / positionHistory.length) * 
                (pt.position2 - positionHistory.reduce((s, p) => s + p.position2, 0) / positionHistory.length),
          0) / (positionHistory.length - 1)
      }
    : { cov11: 0, cov12: 0, cov22: 0 };

  return (
    <div className="mt-4 text-sm text-gray-600 space-y-1 font-mono">
      <div>Covariance Matrix:</div>
      <div className="ml-4">
        [<span style={{ display: 'inline-block', width: '5ch' }}>{formatDisplacement(covariance.cov11)}</span>,  
         <span style={{ display: 'inline-block', width: '5ch' }}>{formatDisplacement(covariance.cov12)}</span>]
      </div>
      <div className="ml-4">
        [<span style={{ display: 'inline-block', width: '5ch' }}>{formatDisplacement(covariance.cov12)}</span>,  
         <span style={{ display: 'inline-block', width: '5ch' }}>{formatDisplacement(covariance.cov22)}</span>]
      </div>
    </div>
  );
};
