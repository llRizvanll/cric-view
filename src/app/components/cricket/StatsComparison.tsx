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
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-3">
        <h3 className="text-base font-semibold text-white mb-1.5 flex items-center gap-1.5">
          <span>⚖️</span>
          {title}
        </h3>
        <p className="text-gray-400 text-xs">Insufficient data for comparison</p>
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
      <div className="bg-gray-700/30 rounded-lg p-2">
        {/* Header */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="text-xs">{icon}</span>
          <div className="text-white font-medium text-xs">{label}</div>
        </div>
        
        {/* Team Comparison */}
        <div className="grid grid-cols-3 items-center gap-2">
          {/* Team 1 */}
          <div className="text-center">
            <div className={`text-sm font-bold ${
              team1Better ? 'text-green-300' : 
              team2Better ? 'text-red-300' : 
              'text-white'
            }`}>
              {value1}{unit}
            </div>
            <div className="text-gray-400 text-xs truncate">{team1.team}</div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-600/30 rounded-full h-1 mt-1 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  team1Better ? 'bg-green-400' :
                  team2Better ? 'bg-red-400' :
                  'bg-blue-400'
                }`}
                style={{ width: `${team1Percentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* VS Indicator */}
          <div className="text-center">
            <div className="w-6 h-6 mx-auto bg-gray-600/30 rounded-full flex items-center justify-center">
              <span className="text-gray-400 font-bold text-xs">VS</span>
            </div>
          </div>
          
          {/* Team 2 */}
          <div className="text-center">
            <div className={`text-sm font-bold ${
              team2Better ? 'text-green-300' : 
              team1Better ? 'text-red-300' : 
              'text-white'
            }`}>
              {value2}{unit}
            </div>
            <div className="text-gray-400 text-xs truncate">{team2.team}</div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-600/30 rounded-full h-1 mt-1 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  team2Better ? 'bg-green-400' :
                  team1Better ? 'bg-red-400' :
                  'bg-purple-400'
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
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-3">
      {/* Header */}
      <div className="text-center mb-3">
        <h3 className="text-base font-bold text-white mb-0.5 flex items-center justify-center gap-1.5">
          <span>⚖️</span>
          {title}
        </h3>
        <div className="text-gray-400 text-xs">Head-to-head analysis</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
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
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="text-sm">🏆</span>
            <div className="text-blue-300 font-semibold text-xs">Higher Scorer</div>
          </div>
          
          <div className="text-lg font-bold text-white mb-0.5">
            {team1.totalRuns > team2.totalRuns ? team1.team : 
             team2.totalRuns > team1.totalRuns ? team2.team : 
             'Perfect Tie!'}
          </div>
          
          {team1.totalRuns !== team2.totalRuns && (
            <div className="text-blue-300 text-xs">
              Victory margin: {Math.abs(team1.totalRuns - team2.totalRuns)} runs
            </div>
          )}
          
          {team1.totalRuns === team2.totalRuns && (
            <div className="text-yellow-300 text-xs">
              Exact same score!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 