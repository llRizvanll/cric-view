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
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">Insufficient data for comparison</p>
        </div>
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
    higherIsBetter = true,
    icon = '📊'
  }: {
    label: string;
    value1: number;
    value2: number;
    unit?: string;
    higherIsBetter?: boolean;
    icon?: string;
  }) => {
    const team1Better = higherIsBetter ? value1 > value2 : value1 < value2;
    const team2Better = higherIsBetter ? value2 > value1 : value2 < value1;
    const maxValue = Math.max(value1, value2);
    const team1Percentage = maxValue > 0 ? (value1 / maxValue) * 100 : 0;
    const team2Percentage = maxValue > 0 ? (value2 / maxValue) * 100 : 0;
    
    return (
      <div className="bg-gray-50 rounded-xl p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-2xl mb-2">{icon}</div>
          <div className="text-gray-900 font-medium text-sm">{label}</div>
        </div>
        
        {/* Team Comparison */}
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Team 1 */}
          <div className="text-center">
            <div className={`text-lg font-bold mb-1 ${
              team1Better ? 'text-green-600' : 
              team2Better ? 'text-red-500' : 
              'text-gray-900'
            }`}>
              {value1}{unit}
            </div>
            <div className="text-gray-600 text-xs font-medium truncate mb-2">{team1.team}</div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  team1Better ? 'bg-green-500' :
                  team2Better ? 'bg-red-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${team1Percentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* VS Indicator */}
          <div className="text-center">
            <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-xs">VS</span>
            </div>
          </div>
          
          {/* Team 2 */}
          <div className="text-center">
            <div className={`text-lg font-bold mb-1 ${
              team2Better ? 'text-green-600' : 
              team1Better ? 'text-red-500' : 
              'text-gray-900'
            }`}>
              {value2}{unit}
            </div>
            <div className="text-gray-600 text-xs font-medium truncate mb-2">{team2.team}</div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  team2Better ? 'bg-green-500' :
                  team1Better ? 'bg-red-500' :
                  'bg-purple-500'
                }`}
                style={{ width: `${team2Percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">Head-to-head statistical comparison</p>
      </div>
      
      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ComparisonItem
          label="Total Runs"
          value1={team1.totalRuns}
          value2={team2.totalRuns}
          icon="🏃"
        />
        
        <ComparisonItem
          label="Run Rate"
          value1={Number(team1.runRate.toFixed(2))}
          value2={Number(team2.runRate.toFixed(2))}
          icon="⚡"
        />
        
        <ComparisonItem
          label="Boundaries"
          value1={team1.boundaries}
          value2={team2.boundaries}
          icon="🎯"
        />
        
        <ComparisonItem
          label="Sixes"
          value1={team1.sixes}
          value2={team2.sixes}
          icon="🚀"
        />
        
        <ComparisonItem
          label="Wickets Lost"
          value1={team1.totalWickets}
          value2={team2.totalWickets}
          higherIsBetter={false}
          icon="📉"
        />
        
        <ComparisonItem
          label="Overs Played"
          value1={Number(team1.totalOvers.toFixed(1))}
          value2={Number(team2.totalOvers.toFixed(1))}
          icon="⏱️"
        />
      </div>
      
      {/* Winner Highlight */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="text-center">
          <div className="text-3xl mb-3">🏆</div>
          <div className="text-blue-900 font-semibold text-sm mb-2">Match Leader</div>
          
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {team1.totalRuns > team2.totalRuns ? team1.team : 
             team2.totalRuns > team1.totalRuns ? team2.team : 
             'Perfect Tie!'}
          </div>
          
          {team1.totalRuns !== team2.totalRuns && (
            <div className="text-blue-700 text-sm">
              Leading by {Math.abs(team1.totalRuns - team2.totalRuns)} runs
            </div>
          )}
          
          {team1.totalRuns === team2.totalRuns && (
            <div className="text-amber-700 text-sm">
              Both teams scored exactly the same!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 