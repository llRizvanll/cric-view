'use client';

import React from 'react';
import { MatchSummary } from '../../models/CricketMatchModel';

interface QuickStatsCardsProps {
  matchSummary: MatchSummary;
}

export const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({ matchSummary }) => {
  const stats = [
    {
      value: Math.max(...matchSummary.teamStats.map(t => t.totalRuns)),
      label: 'Highest Score',
      description: 'Maximum team total',
      icon: '🏆',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      value: matchSummary.teamStats.reduce((sum, t) => sum + t.boundaries, 0),
      label: 'Total Boundaries',
      description: 'Fours scored by both teams',
      icon: '🎯',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      value: matchSummary.teamStats.reduce((sum, t) => sum + t.sixes, 0),
      label: 'Total Sixes',
      description: 'Maximum hits by both teams',
      icon: '🚀',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      value: matchSummary.teamStats.reduce((sum, t) => sum + t.totalWickets, 0),
      label: 'Total Wickets',
      description: 'Wickets fallen in the match',
      icon: '🎳',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl p-6 text-center border border-gray-200`}>
          <div className="text-3xl mb-3">{stat.icon}</div>
          <div className={`text-3xl font-bold ${stat.color} mb-2`}>
            {stat.value}
          </div>
          <div className="text-sm font-semibold text-gray-900 mb-1">
            {stat.label}
          </div>
          <div className="text-xs text-gray-600">
            {stat.description}
          </div>
        </div>
      ))}
    </div>
  );
}; 