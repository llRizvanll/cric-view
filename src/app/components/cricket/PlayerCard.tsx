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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 truncate">{player.name}</h4>
          {rank && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
              #{rank}
            </span>
          )}
        </div>
        
        {isBatsman ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-600">{battingStats.runs}</span>
              <span className="text-sm text-gray-500">({battingStats.balls} balls)</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600">{battingStats.boundaries}</div>
                <div className="text-gray-500 text-xs">4s</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{battingStats.sixes}</div>
                <div className="text-gray-500 text-xs">6s</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{battingStats.strikeRate.toFixed(1)}</div>
                <div className="text-gray-500 text-xs">SR</div>
              </div>
            </div>
            
            {battingStats.dismissals > 0 && (
              <div className="text-xs text-red-500 border-t pt-2">
                Dismissed {battingStats.dismissals} time(s)
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-red-600">{bowlingStats.wickets}</span>
              <span className="text-sm text-gray-500">({bowlingStats.overs} ov)</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{bowlingStats.runs}</div>
                <div className="text-gray-500 text-xs">Runs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{bowlingStats.economy.toFixed(1)}</div>
                <div className="text-gray-500 text-xs">Econ</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{bowlingStats.average.toFixed(1)}</div>
                <div className="text-gray-500 text-xs">Avg</div>
              </div>
            </div>
            
            {bowlingStats.extras > 0 && (
              <div className="text-xs text-orange-500 border-t pt-2">
                {bowlingStats.extras} extras conceded
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 