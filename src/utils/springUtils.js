import * as d3 from 'd3';

export const generateSpringPath = (x1, x2) => {
  const coils = 5;
  const coilWidth = 10;
  const path = d3.path();
  
  path.moveTo(x1, 50);
  
  for (let i = 0; i <= coils; i++) {
    const x = x1 + (i / coils) * (x2 - x1);
    const y = 50 + Math.sin(i * Math.PI) * coilWidth;
    path.lineTo(x, y);
  }
  
  path.lineTo(x2, 50);
  return path.toString();
};

export const formatDisplacement = (value) => {
  const DISPLACEMENT_THRESHOLD = 0.05;
  if (Math.abs(value) < DISPLACEMENT_THRESHOLD) {
    return '\u00A00.0';
  }
  return `${value >= 0 ? '\u00A0' : '-'}${Math.abs(value).toFixed(1)}`;
};

