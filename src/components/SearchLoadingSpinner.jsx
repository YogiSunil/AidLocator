import React from 'react';

const SearchLoadingSpinner = ({ text = 'Searching...' }) => {
  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="text-center">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          
          {/* Inner pulsing dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-lg font-medium text-gray-700 animate-pulse">
            {text}
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          <p className="text-sm text-gray-500">
            Finding the best resources for you...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchLoadingSpinner;