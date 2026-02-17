import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes[size]}
          border-4 border-gray-200 border-t-blue-600
          rounded-full animate-spin
        `}
      />
    </div>
  );
};

// Full page loader
export const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <Loader size="xl" />
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};

// Inline loader with text
export const InlineLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center gap-3 text-gray-600">
      <Loader size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default Loader;
