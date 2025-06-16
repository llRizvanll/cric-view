'use client';

import React from 'react';

interface NavigationHeaderProps {
  matchId: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ matchId }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <button 
        onClick={() => window.history.back()} 
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center space-x-2"
      >
        <span>←</span>
        <span>Back to Matches</span>
      </button>
      
      <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded">
        Match ID: {matchId}
      </div>
    </div>
  );
}; 