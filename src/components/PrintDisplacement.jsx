import { formatDisplacement } from '../utils/springUtils';

const PrintDisplacement = ({ springState }) => {

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

export default PrintDisplacement;
