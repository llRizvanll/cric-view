'use client';

import React from 'react';
import { PlayerStats, BowlingStats } from '../../models/CricketMatchModel';

interface PerformanceHighlightsProps {
  topBatsmen: PlayerStats[];
  topBowlers: BowlingStats[];
}

export const PerformanceHighlights: React.FC<PerformanceHighlightsProps> = ({ 
  topBatsmen, 
  topBowlers 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Batsmen */}
      <div>
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">🏆</div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Top Performers</h4>
            <p className="text-sm text-gray-600">Highest run scorers in the match</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {topBatsmen.slice(0, 3).map((player, index) => (
            <div key={player.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{player.name}</div>
                  <div className="text-sm text-gray-600">
                    {player.balls} balls • {player.boundaries} fours • {player.sixes} sixes
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">{player.runs}</div>
                <div className="text-sm text-gray-600">runs</div>
              </div>
            </div>
          ))}
        </div>
        
        {topBatsmen.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-2">🏏</div>
            <p>No batting data available</p>
          </div>
        )}
      </div>
      
      {/* Top Bowlers */}
      <div>
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">🎯</div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Best Bowlers</h4>
            <p className="text-sm text-gray-600">Leading wicket takers and economical spells</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {topBowlers.slice(0, 3).map((player, index) => (
            <div key={player.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{player.name}</div>
                  <div className="text-sm text-gray-600">
                    {player.overs} overs • {player.runs} runs • {player.economy.toFixed(2)} econ
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-red-600">{player.wickets}</div>
                <div className="text-sm text-gray-600">wickets</div>
              </div>
            </div>
          ))}
        </div>
        
        {topBowlers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-2">⚾</div>
            <p>No bowling data available</p>
          </div>
        )}
      </div>
    </div>
  );
}; 