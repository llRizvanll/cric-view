'use client';

import React from 'react';

interface ErrorStateProps {
  error: string;
  matchId: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, matchId }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
        <div className="text-6xl mb-4">🏏</div>
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <div className="text-sm text-gray-600 mb-4">Match ID: {matchId}</div>
        <button 
          onClick={() => window.history.back()} 
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}; 