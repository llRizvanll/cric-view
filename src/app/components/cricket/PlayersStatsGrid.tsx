'use client';

import React, { useState } from 'react';
import { CricketMatch, PlayerStats, BowlingStats } from '../../models/CricketMatchModel';
import { CricketAnalyticsViewModel } from '../../viewmodels/CricketAnalyticsViewModel';

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">👥</span>
          Players Statistics
        </h2>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="runs">Sort by Runs</option>
            <option value="wickets">Sort by Wickets</option>
            <option value="strikeRate">Sort by Strike Rate</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPlayers.map((player, index) => (
          <div 
            key={`${player.name}-${player.team}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
          >
            {/* Player Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getPlayerStatusIcon(player)}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{player.name}</h3>
                  <p className="text-xs text-gray-500">{player.team}</p>
                </div>
              </div>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                #{index + 1}
              </div>
            </div>

            {/* Batting Stats */}
            {player.batting && (
              <div className="mb-3 p-3 bg-green-50 rounded-lg">
                <h4 className="text-xs font-semibold text-green-800 mb-2 flex items-center">
                  <span className="mr-1">🏏</span>
                  Batting
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Runs:</span>
                    <span className="ml-1 font-bold text-green-700">{player.batting.runs}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Balls:</span>
                    <span className="ml-1 font-bold">{player.batting.balls}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">4s:</span>
                    <span className="ml-1 font-bold text-blue-600">{player.batting.boundaries}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">6s:</span>
                    <span className="ml-1 font-bold text-purple-600">{player.batting.sixes}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Strike Rate:</span>
                    <span className="ml-1 font-bold text-orange-600">
                      {player.batting.strikeRate.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bowling Stats */}
            {player.bowling && (
              <div className="p-3 bg-red-50 rounded-lg">
                <h4 className="text-xs font-semibold text-red-800 mb-2 flex items-center">
                  <span className="mr-1">⚾</span>
                  Bowling
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Overs:</span>
                    <span className="ml-1 font-bold">{player.bowling.overs}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Wickets:</span>
                    <span className="ml-1 font-bold text-red-700">{player.bowling.wickets}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Runs:</span>
                    <span className="ml-1 font-bold">{player.bowling.runs}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Economy:</span>
                    <span className="ml-1 font-bold text-yellow-600">
                      {player.bowling.economy.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* No stats available */}
            {!player.batting && !player.bowling && (
              <div className="text-center text-gray-500 text-sm py-4">
                No statistics available
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{filteredPlayers.length}</div>
            <div className="text-xs text-gray-600">Total Players</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {filteredPlayers.filter(p => p.batting).length}
            </div>
            <div className="text-xs text-gray-600">Batsmen</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">
              {filteredPlayers.filter(p => p.bowling).length}
            </div>
            <div className="text-xs text-gray-600">Bowlers</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">
              {filteredPlayers.filter(p => p.batting && p.bowling).length}
            </div>
            <div className="text-xs text-gray-600">All-rounders</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 