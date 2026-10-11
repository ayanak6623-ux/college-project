import React from 'react';
import useCanvasCursor from '../hooks/useCanvasCursor';

export const CanvasCursor = () => {
  useCanvasCursor();

  return <canvas className='pointer-events-none fixed inset-0 z-50' id='canvas' />;
};
