'use client';

import React from 'react';
import { MatchSummary } from '../../models/CricketMatchModel';

interface QuickStatsCardsProps {
  matchSummary: MatchSummary;
}

export const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({ matchSummary }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">
          {Math.max(...matchSummary.teamStats.map(t => t.totalRuns))}
        </div>
        <div className="text-sm text-gray-600">Highest Score</div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <div className="text-2xl font-bold text-green-600">
          {matchSummary.teamStats.reduce((sum, t) => sum + t.boundaries, 0)}
        </div>
        <div className="text-sm text-gray-600">Total Boundaries</div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">
          {matchSummary.teamStats.reduce((sum, t) => sum + t.sixes, 0)}
        </div>
        <div className="text-sm text-gray-600">Total Sixes</div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <div className="text-2xl font-bold text-red-600">
          {matchSummary.teamStats.reduce((sum, t) => sum + t.totalWickets, 0)}
        </div>
        <div className="text-sm text-gray-600">Total Wickets</div>
      </div>
    </div>
  );
}; 