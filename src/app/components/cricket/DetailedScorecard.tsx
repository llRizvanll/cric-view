'use client';

import React, { useState } from 'react';
import { CricketMatch, CricketInnings } from '../../models/CricketMatchModel';
import { useResponsive } from '../../utils/responsive';

interface DetailedScorecardProps {
  match: CricketMatch;
  selectedInnings?: number;
  onInningsChange?: (inningsIndex: number) => void;
}

interface BattingEntry {
  name: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  position: number;
}

interface BowlingEntry {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  wides: number;
  noballs: number;
}

interface ExtrasBreakdown {
  byes: number;
  legByes: number;
  wides: number;
  noBalls: number;
  penalties: number;
  total: number;
}

export const DetailedScorecard: React.FC<DetailedScorecardProps> = ({ 
  match, 
  selectedInnings = 0,
  onInningsChange 
}) => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling' | 'fow'>('batting');
  
  if (!match.innings || match.innings.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Scorecard</h3>
        <p className="text-slate-400">No innings data available</p>
      </div>
    );
  }

  const innings = match.innings[selectedInnings];
  
  // Calculate detailed batting statistics
  const calculateBattingStats = (innings: CricketInnings): BattingEntry[] => {
    const battingMap = new Map<string, BattingEntry>();
    let position = 1;

    innings.overs.forEach(over => {
      over.deliveries.forEach(delivery => {
        const batter = delivery.batter;
        
        if (!battingMap.has(batter)) {
          battingMap.set(batter, {
            name: batter,
            dismissal: 'not out',
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            position: position++
          });
        }

        const entry = battingMap.get(batter)!;
        entry.runs += delivery.runs.batter;
        entry.balls++;
        
        if (delivery.runs.batter === 4) entry.fours++;
        if (delivery.runs.batter === 6) entry.sixes++;
        
        // Handle dismissals
        if (delivery.wickets) {
          delivery.wickets.forEach(wicket => {
            if (wicket.player_out === batter) {
              let dismissalText = wicket.kind;
              if (wicket.fielders && wicket.fielders.length > 0) {
                dismissalText += ` ${wicket.fielders.map(f => f.name).join(', ')}`;
              }
              dismissalText += ` b ${delivery.bowler}`;
              entry.dismissal = dismissalText;
            }
          });
        }

        entry.strikeRate = entry.balls > 0 ? (entry.runs / entry.balls) * 100 : 0;
      });
    });

    return Array.from(battingMap.values()).sort((a, b) => a.position - b.position);
  };

  // Calculate detailed bowling statistics
  const calculateBowlingStats = (innings: CricketInnings): BowlingEntry[] => {
    const bowlingMap = new Map<string, BowlingEntry>();

    innings.overs.forEach(over => {
      over.deliveries.forEach(delivery => {
        const bowler = delivery.bowler;
        
        if (!bowlingMap.has(bowler)) {
          bowlingMap.set(bowler, {
            name: bowler,
            overs: 0,
            maidens: 0,
            runs: 0,
            wickets: 0,
            economy: 0,
            wides: 0,
            noballs: 0
          });
        }

        const entry = bowlingMap.get(bowler)!;
        entry.runs += delivery.runs.total;
        
        if (delivery.wickets) {
          entry.wickets += delivery.wickets.length;
        }
        
        if (delivery.extras?.wides) entry.wides += delivery.extras.wides;
        if (delivery.extras?.noballs) entry.noballs += delivery.extras.noballs;
      });
    });

    // Calculate overs and economy
    bowlingMap.forEach((entry, bowler) => {
      const bowlerOvers = innings.overs.filter(over => 
        over.deliveries.some(d => d.bowler === bowler)
      ).length;
      
      entry.overs = bowlerOvers;
      entry.economy = bowlerOvers > 0 ? entry.runs / bowlerOvers : 0;
    });

    return Array.from(bowlingMap.values()).filter(entry => entry.overs > 0);
  };

  // Calculate extras breakdown
  const calculateExtras = (innings: CricketInnings): ExtrasBreakdown => {
    const extras: ExtrasBreakdown = {
      byes: 0,
      legByes: 0,
      wides: 0,
      noBalls: 0,
      penalties: 0,
      total: 0
    };

    innings.overs.forEach(over => {
      over.deliveries.forEach(delivery => {
        if (delivery.extras) {
          if (delivery.extras.byes) extras.byes += delivery.extras.byes;
          if (delivery.extras.legbyes) extras.legByes += delivery.extras.legbyes;
          if (delivery.extras.wides) extras.wides += delivery.extras.wides;
          if (delivery.extras.noballs) extras.noBalls += delivery.extras.noballs;
        }
      });
    });

    extras.total = extras.byes + extras.legByes + extras.wides + extras.noBalls + extras.penalties;
    return extras;
  };

  // Calculate fall of wickets
  const calculateFallOfWickets = (innings: CricketInnings) => {
    const fallOfWickets: Array<{
      wicket: number;
      runs: number;
      over: string;
      player: string;
      partnership: number;
    }> = [];
    
    let currentRuns = 0;
    let wicketCount = 0;
    let ballCount = 0;
    let lastWicketRuns = 0;

    innings.overs.forEach((over, overIndex) => {
      over.deliveries.forEach((delivery, ballIndex) => {
        currentRuns += delivery.runs.total;
        ballCount++;

        if (delivery.wickets && delivery.wickets.length > 0) {
          delivery.wickets.forEach(wicket => {
            wicketCount++;
            const overNumber = Math.floor((ballCount - 1) / 6) + 1;
            const ballNumber = ((ballCount - 1) % 6) + 1;
            
            fallOfWickets.push({
              wicket: wicketCount,
              runs: currentRuns,
              over: `${overNumber}.${ballNumber}`,
              player: wicket.player_out,
              partnership: currentRuns - lastWicketRuns
            });
            
            lastWicketRuns = currentRuns;
          });
        }
      });
    });

    return fallOfWickets;
  };

  const battingStats = calculateBattingStats(innings);
  const bowlingStats = calculateBowlingStats(innings);
  const extras = calculateExtras(innings);
  const fallOfWickets = calculateFallOfWickets(innings);

  // Calculate total runs and wickets
  const totalRuns = battingStats.reduce((sum, player) => sum + player.runs, 0) + extras.total;
  const totalWickets = battingStats.filter(player => player.dismissal !== 'not out').length;
  const totalBalls = battingStats.reduce((sum, player) => sum + player.balls, 0);
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  const runRate = totalBalls > 0 ? (totalRuns * 6) / totalBalls : 0;

  return (
    <div className="space-y-6">
      {/* Innings Header */}
      <div className="bg-gradient-to-r from-slate-800/95 to-slate-700/95 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/30 to-emerald-600/30 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{innings.team}</h2>
              <div className="flex items-center gap-4 text-slate-200">
                <span className="text-sm">{selectedInnings + 1}{selectedInnings === 0 ? 'st' : 'nd'} Innings</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{match.info.venue}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {totalRuns}/{totalWickets}
              </div>
              <div className="text-slate-200 text-lg">
                ({overs}.{balls} overs, RR: {runRate.toFixed(2)})
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex">
            {[
              { key: 'batting', label: '🏏 Batting', icon: '🏏' },
              { key: 'bowling', label: '⚾ Bowling', icon: '⚾' },
              { key: 'fow', label: '📉 Fall of Wickets', icon: '📉' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                {isMobile ? tab.icon : tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'batting' && (
            <div className="space-y-4">
              {/* Batting Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50 text-slate-300">
                      <th className="text-left p-3 font-medium">Batsman</th>
                      {!isMobile && <th className="text-left p-3 font-medium">Dismissal</th>}
                      <th className="text-right p-3 font-medium">R</th>
                      <th className="text-right p-3 font-medium">B</th>
                      <th className="text-right p-3 font-medium">4s</th>
                      <th className="text-right p-3 font-medium">6s</th>
                      <th className="text-right p-3 font-medium">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battingStats.map((player, index) => (
                      <tr 
                        key={player.name} 
                        className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-slate-600/50 rounded-full flex items-center justify-center text-xs font-bold text-slate-300">
                              {player.position}
                            </span>
                            <div>
                              <span className="font-medium text-white block">{player.name}</span>
                              {isMobile && (
                                <span className={`text-xs ${player.dismissal === 'not out' ? 'text-green-400' : 'text-red-400'}`}>
                                  {player.dismissal}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        {!isMobile && (
                          <td className="p-3 text-slate-300 max-w-xs">
                            <span className={`text-xs ${player.dismissal === 'not out' ? 'text-green-400 font-medium' : 'text-red-400'}`}>
                              {player.dismissal}
                            </span>
                          </td>
                        )}
                        <td className="p-3 text-right font-bold text-white">{player.runs}</td>
                        <td className="p-3 text-right text-slate-300">{player.balls}</td>
                        <td className="p-3 text-right text-green-400 font-medium">{player.fours}</td>
                        <td className="p-3 text-right text-purple-400 font-medium">{player.sixes}</td>
                        <td className="p-3 text-right text-blue-400 font-medium">
                          {player.strikeRate.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Extras and Total */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-slate-400 mb-1">Extras</div>
                    <div className="font-bold text-orange-400">{extras.total}</div>
                    <div className="text-xs text-slate-500">
                      (b {extras.byes}, lb {extras.legByes}, w {extras.wides}, nb {extras.noBalls})
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 mb-1">Total</div>
                    <div className="font-bold text-white text-lg">
                      {totalRuns}/{totalWickets}
                    </div>
                    <div className="text-xs text-slate-400">
                      ({overs}.{balls} ov)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 mb-1">Run Rate</div>
                    <div className="font-bold text-blue-400">{runRate.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 mb-1">Boundaries</div>
                    <div className="font-bold text-green-400">
                      {battingStats.reduce((sum, p) => sum + p.fours, 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 mb-1">Sixes</div>
                    <div className="font-bold text-purple-400">
                      {battingStats.reduce((sum, p) => sum + p.sixes, 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 mb-1">Highest</div>
                    <div className="font-bold text-yellow-400">
                      {Math.max(...battingStats.map(p => p.runs))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bowling' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-slate-300">
                    <th className="text-left p-3 font-medium">Bowler</th>
                    <th className="text-right p-3 font-medium">O</th>
                    <th className="text-right p-3 font-medium">M</th>
                    <th className="text-right p-3 font-medium">R</th>
                    <th className="text-right p-3 font-medium">W</th>
                    <th className="text-right p-3 font-medium">Econ</th>
                    {!isMobile && <th className="text-right p-3 font-medium">Wd</th>}
                    {!isMobile && <th className="text-right p-3 font-medium">Nb</th>}
                  </tr>
                </thead>
                <tbody>
                  {bowlingStats.map((bowler, index) => (
                    <tr 
                      key={bowler.name} 
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="p-3 font-medium text-white">{bowler.name}</td>
                      <td className="p-3 text-right text-slate-300">{bowler.overs}</td>
                      <td className="p-3 text-right text-slate-300">{bowler.maidens}</td>
                      <td className="p-3 text-right text-slate-300">{bowler.runs}</td>
                      <td className="p-3 text-right font-bold text-red-400">{bowler.wickets}</td>
                      <td className="p-3 text-right text-blue-400 font-medium">
                        {bowler.economy.toFixed(2)}
                      </td>
                      {!isMobile && (
                        <>
                          <td className="p-3 text-right text-orange-400">{bowler.wides}</td>
                          <td className="p-3 text-right text-orange-400">{bowler.noballs}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'fow' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Fall of Wickets</h4>
              {fallOfWickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fallOfWickets.map((wicket, index) => (
                    <div 
                      key={index}
                      className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-red-400 font-bold">
                          {wicket.wicket}/{wicket.runs}
                        </span>
                        <span className="text-slate-400 text-sm">
                          ({wicket.over} ov)
                        </span>
                      </div>
                      <div className="text-white font-medium mb-1">{wicket.player}</div>
                      <div className="text-slate-400 text-sm">
                        Partnership: {wicket.partnership} runs
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-4xl mb-2">🏏</div>
                  <p>No wickets fell in this innings</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Innings Selector for multi-innings matches */}
      {match.innings && match.innings.length > 1 && onInningsChange && (
        <div className="flex justify-center">
          <div className="flex gap-2 bg-slate-800/50 rounded-lg p-2">
            {match.innings.map((inning, index) => (
              <button
                key={index}
                onClick={() => onInningsChange(index)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedInnings === index
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {inning.team}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 