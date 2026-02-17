import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl
        border border-gray-200
        shadow-sm
        ${hover ? 'hover:shadow-md hover:border-gray-300 cursor-pointer transition-all duration-200' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
