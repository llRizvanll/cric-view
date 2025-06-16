'use client';

import React from 'react';

interface LoadingStateProps {
  matchId: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ matchId }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-xl text-gray-600">Loading enhanced analytics...</div>
        <div className="text-sm text-gray-500 mt-2">Match ID: {matchId}</div>
      </div>
    </div>
  );
}; 