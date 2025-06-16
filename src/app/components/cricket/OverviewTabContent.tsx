'use client';

import React from 'react';
import { CricketMatch, MatchSummary, PlayerStats, BowlingStats } from '../../models/CricketMatchModel';
import { ManhattanChart, QuickStatsCards, PerformanceHighlights } from './';

interface OverviewTabContentProps {
  matchData: CricketMatch;
  matchSummary: MatchSummary;
  topBatsmen: PlayerStats[];
  topBowlers: BowlingStats[];
  generateManhattanData: (match: CricketMatch, inningsIndex: number) => Array<{
    over: number;
    runs: number;
    wickets: number;
  }>;
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ 
  matchData, 
  matchSummary, 
  topBatsmen, 
  topBowlers,
  generateManhattanData
}) => {
  return (
    <>
      {/* Manhattan Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {matchData.innings?.map((innings, index) => (
          <ManhattanChart
            key={index}
            data={generateManhattanData(matchData, index)}
            title={`${innings.team} - Runs Per Over`}
            height={300}
          />
        ))}
      </div>

      {/* Quick Performance Cards */}
      <QuickStatsCards matchSummary={matchSummary} />

      {/* Performance Highlights */}
      <PerformanceHighlights topBatsmen={topBatsmen} topBowlers={topBowlers} />
    </>
  );
}; 