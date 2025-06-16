import React from 'react';
import { CricketMatch, CricketInnings } from '../../models/CricketMatchModel';

interface ScoreCardProps {
  match: CricketMatch;
  selectedInnings?: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ match, selectedInnings = 0 }) => {
  const innings = match.innings?.[selectedInnings];
  
  if (!innings) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Score Card</h3>
        <p className="text-gray-500">No innings data available</p>
      </div>
    );
  }

  // Calculate innings totals
  const calculateInningsStats = (innings: CricketInnings) => {
    let totalRuns = 0;
    let totalWickets = 0;
    let totalBalls = 0;
    let boundaries = 0;
    let sixes = 0;

    innings.overs.forEach(over => {
      over.deliveries.forEach(delivery => {
        totalRuns += delivery.runs.total;
        totalBalls++;
        
        if (delivery.runs.batter === 4) boundaries++;
        if (delivery.runs.batter === 6) sixes++;
        
        if (delivery.wickets) {
          totalWickets += delivery.wickets.length;
        }
      });
    });

    const overs = Math.floor(totalBalls / 6);
    const balls = totalBalls % 6;
    const runRate = totalBalls > 0 ? (totalRuns * 6) / totalBalls : 0;

    return {
      totalRuns,
      totalWickets,
      overs: `${overs}.${balls}`,
      runRate: runRate.toFixed(2),
      boundaries,
      sixes
    };
  };

  const stats = calculateInningsStats(innings);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-lg">
        <h3 className="text-xl font-bold">{innings.team}</h3>
        <div className="text-3xl font-bold mt-2">
          {stats.totalRuns}/{stats.totalWickets}
          <span className="text-lg ml-2">({stats.overs} overs)</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{stats.runRate}</div>
            <div className="text-sm text-gray-600">Run Rate</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">{stats.boundaries}</div>
            <div className="text-sm text-gray-600">Fours</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">{stats.sixes}</div>
            <div className="text-sm text-gray-600">Sixes</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-2xl font-bold text-red-600">{stats.totalWickets}</div>
            <div className="text-sm text-gray-600">Wickets</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 