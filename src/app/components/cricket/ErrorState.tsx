'use client';

import React from 'react';

interface ErrorStateProps {
  error: string;
  matchId?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  matchId, 
  onRetry, 
  onBack 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 max-w-md mx-4">
          {/* Error Icon */}
          <div className="mb-4">
            <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-white">
              Oops! Something went wrong
            </h2>
            <div className="text-gray-400 text-xs">
              We couldn't load the cricket analytics
            </div>
            
            {/* Match ID if provided */}
            {matchId && (
              <div className="inline-flex items-center gap-1.5 bg-gray-700/50 px-2.5 py-1 rounded-md">
                <span className="text-red-400 text-xs">⚠️</span>
                <span className="text-gray-300 text-xs">
                  Match ID: <span className="font-mono text-white">{matchId}</span>
                </span>
              </div>
            )}

            {/* Error Details */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-left">
              <div className="flex items-start gap-1.5">
                <span className="text-red-400 text-xs mt-0.5">🔍</span>
                <div>
                  <div className="text-red-300 font-medium text-xs mb-0.5">Error Details:</div>
                  <div className="text-red-200 text-xs leading-relaxed">
                    {error}
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting Tips */}
            <div className="bg-gray-700/30 rounded-lg p-3 text-left">
              <div className="text-gray-300 font-medium text-xs mb-1">💡 Try these steps:</div>
              <ul className="text-gray-400 text-xs space-y-0.5">
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  Check your internet connection
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  Verify the match ID is correct
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  Wait a moment and try again
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                🔄 Try Again
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-xs font-medium py-2.5 px-4 rounded-lg transition-all duration-200"
              >
                ← Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 