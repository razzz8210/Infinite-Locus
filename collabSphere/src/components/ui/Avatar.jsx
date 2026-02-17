import React from 'react';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

const Avatar = ({
  name,
  image,
  size = 'md',
  className = '',
  showStatus = false,
  isOnline = false,
}) => {
  // Generate consistent color based on name
  const colorIndex = name
    ? name.charCodeAt(0) % colors.length
    : 0;
  const bgColor = colors[colorIndex];

  // Get initials
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className={`relative inline-flex ${className}`}>
      {image ? (
        <img
          src={image}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <div
          className={`
            ${sizes[size]} ${bgColor}
            rounded-full flex items-center justify-center
            text-white font-semibold
            ring-2 ring-white
          `}
        >
          {initials}
        </div>
      )}
      
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0
            w-3 h-3 rounded-full
            ring-2 ring-white
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
          `}
        />
      )}
    </div>
  );
};

// Avatar Group
export const AvatarGroup = ({ users, max = 4, size = 'sm' }) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <Avatar
          key={user.id || index}
          name={user.name}
          image={user.image}
          size={size}
          className="hover:z-10 transition-transform hover:scale-110"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            ${sizes[size]}
            rounded-full bg-gray-200 text-gray-600
            flex items-center justify-center font-medium
            ring-2 ring-white
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
