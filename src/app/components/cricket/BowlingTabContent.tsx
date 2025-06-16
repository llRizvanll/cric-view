'use client';

import React from 'react';
import { BowlingStats } from '../../models/CricketMatchModel';
import { PlayerCard, BarChart } from './';

interface BowlingTabContentProps {
  topBowlers: BowlingStats[];
}

export const BowlingTabContent: React.FC<BowlingTabContentProps> = ({ topBowlers }) => {
  return (
    <>
      {/* Top Bowlers Grid */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5">
          <span>⚾</span>
          Bowling Figures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {topBowlers.map((player, index) => (
            <PlayerCard 
              key={player.name} 
              player={player} 
              type="bowling" 
              rank={index + 1} 
            />
          ))}
        </div>
      </div>

      {/* Bowling Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <BarChart
          data={topBowlers.slice(0, 8).map(player => ({
            name: player.name.split(' ').pop() || player.name,
            wickets: player.wickets
          }))}
          xAxisKey="name"
          yAxisKey="wickets"
          title="Wicket Takers"
          color="#ef4444"
        />
        
        <BarChart
          data={topBowlers.slice(0, 8).map(player => ({
            name: player.name.split(' ').pop() || player.name,
            economy: player.economy
          }))}
          xAxisKey="name"
          yAxisKey="economy"
          title="Economy Rates"
          color="#f59e0b"
        />
      </div>
    </>
  );
}; 