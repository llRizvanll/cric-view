'use client';

import React, { useState } from 'react';
import { CricketMatch, PlayerStats, BowlingStats } from '../../models/CricketMatchModel';
import { CricketAnalyticsViewModel } from '../../viewmodels/CricketAnalyticsViewModel';
import { getResponsiveGap, getResponsiveText, useResponsive } from '../../utils/responsive';

interface PlayersStatsGridProps {
  match: CricketMatch;
  viewModel: CricketAnalyticsViewModel;
}

interface CombinedPlayerStats {
  name: string;
  team: string;
  batting?: PlayerStats;
  bowling?: BowlingStats;
}

export const PlayersStatsGrid: React.FC<PlayersStatsGridProps> = ({ match, viewModel }) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'runs' | 'wickets' | 'strikeRate'>('runs');
  const { isMobile, isTablet } = useResponsive();

  // Combine all player statistics using the viewModel
  const getAllPlayers = (): CombinedPlayerStats[] => {
    const playersMap = new Map<string, CombinedPlayerStats>();
    
    // Get all batsmen stats (using large limit to get all players)
    const allBatsmen = viewModel.getTopBatsmen(100);
    const allBowlers = viewModel.getTopBowlers(100);

    // Get team information from match data
    const getPlayerTeam = (playerName: string): string => {
      const players = match.info.players;
      if (players) {
        for (const [teamName, teamPlayers] of Object.entries(players)) {
          if (teamPlayers.includes(playerName)) {
            return teamName;
          }
        }
      }
      
      // Fallback: check innings to see which team the player belongs to
      for (const innings of match.innings || []) {
        for (const over of innings.overs) {
          for (const delivery of over.deliveries) {
            if (delivery.batter === playerName || delivery.bowler === playerName) {
              return innings.team;
            }
          }
        }
      }
      
      return 'Unknown';
    };

    // Process batting stats
    allBatsmen.forEach(batsman => {
      const team = getPlayerTeam(batsman.name);
      const key = `${batsman.name}-${team}`;
      playersMap.set(key, {
        name: batsman.name,
        team: team,
        batting: batsman,
      });
    });

    // Process bowling stats
    allBowlers.forEach(bowler => {
      const team = getPlayerTeam(bowler.name);
      const key = `${bowler.name}-${team}`;
      if (playersMap.has(key)) {
        const player = playersMap.get(key)!;
        player.bowling = bowler;
      } else {
        playersMap.set(key, {
          name: bowler.name,
          team: team,
          bowling: bowler,
        });
      }
    });

    return Array.from(playersMap.values());
  };

  const allPlayers = getAllPlayers();
  const teams = Array.from(new Set(allPlayers.map(p => p.team)));

  // Filter players by selected team
  const filteredPlayers = selectedTeam === 'all' 
    ? allPlayers 
    : allPlayers.filter(player => player.team === selectedTeam);

  // Sort players based on selected criteria
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'runs':
        return (b.batting?.runs || 0) - (a.batting?.runs || 0);
      case 'wickets':
        return (b.bowling?.wickets || 0) - (a.bowling?.wickets || 0);
      case 'strikeRate':
        return (b.batting?.strikeRate || 0) - (a.batting?.strikeRate || 0);
      default:
        return 0;
    }
  });

  const getPlayerStatusIcon = (player: CombinedPlayerStats) => {
    if (player.batting && player.batting.dismissals === 0) return '🟢'; // Not out
    if (player.batting && player.batting.dismissals > 0) return '🔴'; // Out
    if (player.bowling && !player.batting) return '⚾'; // Bowler only
    return '⚪'; // Default
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-2 md:p-3 lg:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 space-y-2 sm:space-y-0">
        <h2 className={`${getResponsiveText('text-sm', 'md:text-base', 'lg:text-lg')} font-bold text-white flex items-center`}>
          <span className="mr-1.5">👥</span>
          Players Statistics
        </h2>
        
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-row'} ${getResponsiveGap('gap-1.5', 'md:gap-2', 'lg:gap-3')}`}>
          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className={`px-2 py-1 ${getResponsiveText('text-xs', 'md:text-sm')} border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'w-full' : ''}`}
          >
            <option value="all">All Teams</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-2 py-1 ${getResponsiveText('text-xs', 'md:text-sm')} border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'w-full' : ''}`}
          >
            <option value="runs">Sort by Runs</option>
            <option value="wickets">Sort by Wickets</option>
            <option value="strikeRate">Sort by Strike Rate</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Players Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'} ${getResponsiveGap('gap-2', 'md:gap-3', 'lg:gap-4')} mb-3`}>
        {sortedPlayers.map((player, index) => (
          <div 
            key={`${player.name}-${player.team}`}
            className="border border-gray-600/50 rounded-lg p-2 hover:border-gray-500/50 transition-all bg-gray-700/30"
          >
            {/* Player Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">{getPlayerStatusIcon(player)}</span>
                <div>
                  <h3 className="font-medium text-white text-xs">{player.name}</h3>
                  <p className="text-xs text-gray-400">{player.team}</p>
                </div>
              </div>
              <div className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md">
                #{index + 1}
              </div>
            </div>

            {/* Batting Stats */}
            {player.batting && (
              <div className="mb-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="text-xs font-medium text-green-300 mb-1.5 flex items-center">
                  <span className="mr-1">🏏</span>
                  Batting
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="bg-gray-800/30 rounded-md p-1">
                    <span className="text-gray-400">Runs:</span>
                    <span className="ml-1 font-medium text-green-300">{player.batting.runs}</span>
                  </div>
                  <div className="bg-gray-800/30 rounded-md p-1">
                    <span className="text-gray-400">Balls:</span>
                    <span className="ml-1 font-medium text-white">{player.batting.balls}</span>
                  </div>
                  <div className="bg-gray-800/30 rounded-md p-1">
                    <span className="text-gray-400">4s:</span>
                    <span className="ml-1 font-medium text-blue-300">{player.batting.boundaries}</span>
                  </div>
                  <div className="bg-gray-800/30 rounded-md p-1">
                    <span className="text-gray-400">6s:</span>
                    <span className="ml-1 font-medium text-purple-300">{player.batting.sixes}</span>
                  </div>
                  <div className="col-span-2 bg-gray-800/30 rounded-md p-1">
                    <span className="text-gray-400">Strike Rate:</span>
                    <span className="ml-1 font-medium text-orange-300">
                      {player.batting.strikeRate.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bowling Stats */}
            {player.bowling && (
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h4 className="text-xs font-medium text-red-300 mb-1.5 flex items-center">
                  <span className="mr-1">⚾</span>
                  Bowling
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="bg-gray-800/30 rounded-md p-1">
                    <span className="text-gray-400">Overs:</span>
                    <span className="ml-1 font-medium text-white">{player.bowling.overs}</span>
                  </div>
                  <div className="bg-gray-800/30 rounded-md p-1">
                    <span className="text-gray-400">Wickets:</span>
                    <span className="ml-1 font-medium text-red-300">{player.bowling.wickets}</span>
                  </div>
                  <div className="bg-gray-800/30 rounded-md p-1">
                    <span className="text-gray-400">Runs:</span>
                    <span className="ml-1 font-medium text-white">{player.bowling.runs}</span>
                  </div>
                  <div className="bg-gray-800/30 rounded-md p-1">
                    <span className="text-gray-400">Economy:</span>
                    <span className="ml-1 font-medium text-yellow-300">
                      {player.bowling.economy.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* No stats available */}
            {!player.batting && !player.bowling && (
              <div className="text-center text-gray-500 text-xs py-2">
                No statistics available
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-2 border-t border-gray-600/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <div className="text-lg font-bold text-blue-300">{filteredPlayers.length}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
            <div className="text-lg font-bold text-green-300">
              {filteredPlayers.filter(p => p.batting).length}
            </div>
            <div className="text-xs text-gray-400">Batsmen</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            <div className="text-lg font-bold text-red-300">
              {filteredPlayers.filter(p => p.bowling).length}
            </div>
            <div className="text-xs text-gray-400">Bowlers</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
            <div className="text-lg font-bold text-purple-300">
              {filteredPlayers.filter(p => p.batting && p.bowling).length}
            </div>
            <div className="text-xs text-gray-400">All-rounders</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 