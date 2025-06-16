'use client';

import React from 'react';

interface LoadingStateProps {
  matchId: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ matchId }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 max-w-xs mx-4">
          {/* Animated Cricket Ball */}
          <div className="relative mb-4">
            <div className="w-12 h-12 mx-auto relative">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 border-2 border-gray-600/30 rounded-full animate-spin"></div>
              <div className="absolute inset-0 border-2 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin"></div>
              
              {/* Inner cricket ball */}
              <div className="absolute inset-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-0.5 bg-white/80 rounded-full"></div>
              </div>
            </div>

            {/* Bouncing dots */}
            <div className="flex justify-center gap-1 mt-3">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1 h-1 bg-teal-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-white">
              Loading Cricket Analytics
            </h2>
            <div className="text-gray-400 text-xs">
              Preparing match insights...
            </div>
            
            {/* Match ID Badge */}
            <div className="inline-flex items-center gap-1.5 bg-gray-700/50 px-2.5 py-1 rounded-md">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-xs">
                Match ID: <span className="font-mono text-white">{matchId}</span>
              </span>
            </div>

            {/* Loading Steps */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-0.5 h-0.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>Fetching match data...</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                <span>Processing statistics...</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                <span>Building analytics...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 