import React from 'react';
import { PlayerStats, BowlingStats } from '../../models/CricketMatchModel';

interface PlayerCardProps {
  player: PlayerStats | BowlingStats;
  type: 'batting' | 'bowling';
  rank?: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, type, rank }) => {
  const isBatsman = type === 'batting';
  const battingStats = player as PlayerStats;
  const bowlingStats = player as BowlingStats;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 truncate text-sm">{player.name}</h4>
          {rank && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-md">
              #{rank}
            </span>
          )}
        </div>
        
        {isBatsman ? (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-blue-600">{battingStats.runs}</span>
              <span className="text-xs text-gray-500">({battingStats.balls} balls)</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <div className="text-center bg-green-50 rounded-md p-1">
                <div className="font-medium text-green-600">{battingStats.boundaries}</div>
                <div className="text-gray-500">4s</div>
              </div>
              <div className="text-center bg-purple-50 rounded-md p-1">
                <div className="font-medium text-purple-600">{battingStats.sixes}</div>
                <div className="text-gray-500">6s</div>
              </div>
              <div className="text-center bg-orange-50 rounded-md p-1">
                <div className="font-medium text-orange-600">{battingStats.strikeRate.toFixed(1)}</div>
                <div className="text-gray-500">SR</div>
              </div>
            </div>
            
            {battingStats.dismissals > 0 && (
              <div className="text-xs text-red-500 border-t pt-1.5 mt-1.5">
                Dismissed {battingStats.dismissals} time(s)
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-red-600">{bowlingStats.wickets}</span>
              <span className="text-xs text-gray-500">({bowlingStats.overs} ov)</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <div className="text-center bg-blue-50 rounded-md p-1">
                <div className="font-medium text-blue-600">{bowlingStats.runs}</div>
                <div className="text-gray-500">Runs</div>
              </div>
              <div className="text-center bg-green-50 rounded-md p-1">
                <div className="font-medium text-green-600">{bowlingStats.economy.toFixed(1)}</div>
                <div className="text-gray-500">Econ</div>
              </div>
              <div className="text-center bg-purple-50 rounded-md p-1">
                <div className="font-medium text-purple-600">{bowlingStats.average.toFixed(1)}</div>
                <div className="text-gray-500">Avg</div>
              </div>
            </div>
            
            {bowlingStats.extras > 0 && (
              <div className="text-xs text-orange-500 border-t pt-1.5 mt-1.5">
                {bowlingStats.extras} extras conceded
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 