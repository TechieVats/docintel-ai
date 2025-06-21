import React from 'react';

const LoadingSpinner = ({ message = "Loading...", size = "medium" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-blue-500`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${sizeClasses[size].replace('h-', 'w-').replace('w-', 'h-')} bg-white rounded-full`}></div>
        </div>
      </div>
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 