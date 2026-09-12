import React from 'react';

export const Crosshair: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-20">
      <div 
        className="w-4 h-4 relative flex items-center justify-center"
        style={{ mixBlendMode: 'difference' }}
      >
        {/* Horizontal bar */}
        <div className="absolute w-4 h-[2px] bg-white" />
        {/* Vertical bar */}
        <div className="absolute h-4 w-[2px] bg-white" />
      </div>
    </div>
  );
};
