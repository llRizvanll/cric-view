'use client';

import React from 'react';
import { PlayerStats } from '../../models/CricketMatchModel';
import { PlayerCard, BarChart } from './';

interface BattingTabContentProps {
  topBatsmen: PlayerStats[];
}

export const BattingTabContent: React.FC<BattingTabContentProps> = ({ topBatsmen }) => {
  return (
    <>
      {/* Top Batsmen Grid */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5">
          <span>🏏</span>
          Top Batting Performances
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {topBatsmen.map((player, index) => (
            <PlayerCard 
              key={player.name} 
              player={player} 
              type="batting" 
              rank={index + 1} 
            />
          ))}
        </div>
      </div>

      {/* Batting Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <BarChart
          data={topBatsmen.slice(0, 8).map(player => ({
            name: player.name.split(' ').pop() || player.name,
            runs: player.runs,
            strikeRate: player.strikeRate
          }))}
          xAxisKey="name"
          yAxisKey="runs"
          title="Top Run Scorers"
          color="#3b82f6"
        />
        
        <BarChart
          data={topBatsmen.slice(0, 8).map(player => ({
            name: player.name.split(' ').pop() || player.name,
            strikeRate: player.strikeRate
          }))}
          xAxisKey="name"
          yAxisKey="strikeRate"
          title="Strike Rates"
          color="#10b981"
        />
      </div>
    </>
  );
}; 