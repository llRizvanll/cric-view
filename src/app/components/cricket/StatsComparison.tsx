import React from 'react';
import { TeamStats } from '../../models/CricketMatchModel';

interface StatsComparisonProps {
  teamStats: TeamStats[];
  title?: string;
}

export const StatsComparison: React.FC<StatsComparisonProps> = ({ 
  teamStats, 
  title = "Team Comparison" 
}) => {
  if (!teamStats || teamStats.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-500">Insufficient data for comparison</p>
      </div>
    );
  }

  const team1 = teamStats[0];
  const team2 = teamStats[1];

  const ComparisonItem = ({ 
    label, 
    value1, 
    value2, 
    unit = '',
    higherIsBetter = true 
  }: {
    label: string;
    value1: number;
    value2: number;
    unit?: string;
    higherIsBetter?: boolean;
  }) => {
    const team1Better = higherIsBetter ? value1 > value2 : value1 < value2;
    const team2Better = higherIsBetter ? value2 > value1 : value2 < value1;
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="text-center flex-1">
          <div className={`text-lg font-bold ${team1Better ? 'text-green-600' : team2Better ? 'text-red-600' : 'text-gray-700'}`}>
            {value1}{unit}
          </div>
          <div className="text-xs text-gray-600">{team1.team}</div>
        </div>
        
        <div className="text-center px-4">
          <div className="text-sm font-semibold text-gray-700">{label}</div>
        </div>
        
        <div className="text-center flex-1">
          <div className={`text-lg font-bold ${team2Better ? 'text-green-600' : team1Better ? 'text-red-600' : 'text-gray-700'}`}>
            {value2}{unit}
          </div>
          <div className="text-xs text-gray-600">{team2.team}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6 text-center">{title}</h3>
      
      <div className="space-y-4">
        <ComparisonItem
          label="Total Runs"
          value1={team1.totalRuns}
          value2={team2.totalRuns}
        />
        
        <ComparisonItem
          label="Run Rate"
          value1={Number(team1.runRate.toFixed(2))}
          value2={Number(team2.runRate.toFixed(2))}
        />
        
        <ComparisonItem
          label="Boundaries"
          value1={team1.boundaries}
          value2={team2.boundaries}
        />
        
        <ComparisonItem
          label="Sixes"
          value1={team1.sixes}
          value2={team2.sixes}
        />
        
        <ComparisonItem
          label="Wickets Lost"
          value1={team1.totalWickets}
          value2={team2.totalWickets}
          higherIsBetter={false}
        />
        
        <ComparisonItem
          label="Overs Played"
          value1={Number(team1.totalOvers.toFixed(1))}
          value2={Number(team2.totalOvers.toFixed(1))}
        />
      </div>
      
      {/* Winner Highlight */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-sm text-blue-600 font-medium">Higher Scorer</div>
          <div className="text-lg font-bold text-blue-700">
            {team1.totalRuns > team2.totalRuns ? team1.team : 
             team2.totalRuns > team1.totalRuns ? team2.team : 
             'Tie'}
          </div>
          {team1.totalRuns !== team2.totalRuns && (
            <div className="text-sm text-blue-600">
              by {Math.abs(team1.totalRuns - team2.totalRuns)} runs
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 