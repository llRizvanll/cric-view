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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 Top Performers</h3>
        <div className="space-y-3">
          {topBatsmen.slice(0, 3).map((player, index) => (
            <div key={player.name} className="flex justify-between items-center">
              <span className="font-medium">{player.name}</span>
              <span className="text-blue-600 font-bold">{player.runs} runs</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Best Bowlers</h3>
        <div className="space-y-3">
          {topBowlers.slice(0, 3).map((player, index) => (
            <div key={player.name} className="flex justify-between items-center">
              <span className="font-medium">{player.name}</span>
              <span className="text-red-600 font-bold">{player.wickets} wickets</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 