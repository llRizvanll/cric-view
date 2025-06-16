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
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Match Scorecard</h3>
        <p className="text-gray-600">No innings data available</p>
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
      {/* Apple-style Innings Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{innings.team}</h2>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="text-sm font-medium">{selectedInnings + 1}{selectedInnings === 0 ? 'st' : 'nd'} Innings</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm">{match.info.venue}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {totalRuns}/{totalWickets}
              </div>
              <div className="text-gray-600">
                ({overs}.{balls} overs, RR: {runRate.toFixed(2)})
              </div>
            </div>
          </div>
        </div>

        {/* Apple-style Tab Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex">
            {[
              { key: 'batting', label: 'Batting', icon: '🏏' },
              { key: 'bowling', label: 'Bowling', icon: '⚾' },
              { key: 'fow', label: 'Fall of Wickets', icon: '📉' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
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
            <div className="space-y-6">
              {/* Batting Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Batsman</th>
                      {!isMobile && <th className="text-left py-3 px-4 font-semibold text-gray-900">Dismissal</th>}
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">R</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">B</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">4s</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">6s</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battingStats.map((player, index) => (
                      <tr 
                        key={player.name} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-600">{player.position}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{player.name}</div>
                              {isMobile && (
                                <div className={`text-xs ${player.dismissal === 'not out' ? 'text-green-600' : 'text-red-600'}`}>
                                  {player.dismissal}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {!isMobile && (
                          <td className="py-3 px-4 text-gray-600 max-w-xs">
                            <span className={`text-sm ${player.dismissal === 'not out' ? 'text-green-600 font-medium' : 'text-red-600'}`}>
                              {player.dismissal}
                            </span>
                          </td>
                        )}
                        <td className="py-3 px-4 text-right font-bold text-gray-900">{player.runs}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{player.balls}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">{player.fours}</td>
                        <td className="py-3 px-4 text-right font-semibold text-purple-600">{player.sixes}</td>
                        <td className="py-3 px-4 text-right font-semibold text-blue-600">
                          {player.strikeRate.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Extras and Total */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  <div className="text-center">
                    <div className="text-gray-600 text-sm font-medium mb-2">Extras</div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">{extras.total}</div>
                    <div className="text-xs text-gray-500">
                      (b {extras.byes}, lb {extras.legByes}, w {extras.wides}, nb {extras.noBalls})
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total</div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {totalRuns}/{totalWickets}
                    </div>
                    <div className="text-xs text-gray-500">
                      ({overs}.{balls} ov)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-sm font-medium mb-2">Run Rate</div>
                    <div className="text-2xl font-bold text-blue-600">{runRate.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-sm font-medium mb-2">Boundaries</div>
                    <div className="text-2xl font-bold text-green-600">
                      {battingStats.reduce((sum, p) => sum + p.fours, 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-sm font-medium mb-2">Sixes</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {battingStats.reduce((sum, p) => sum + p.sixes, 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-sm font-medium mb-2">Highest</div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {Math.max(...battingStats.map(p => p.runs))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bowling' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Bowler</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">O</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">M</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">R</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">W</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Econ</th>
                    {!isMobile && <th className="text-right py-3 px-4 font-semibold text-gray-900">Wd</th>}
                    {!isMobile && <th className="text-right py-3 px-4 font-semibold text-gray-900">Nb</th>}
                  </tr>
                </thead>
                <tbody>
                  {bowlingStats.map((bowler, index) => (
                    <tr 
                      key={bowler.name} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{bowler.name}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{bowler.overs}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{bowler.maidens}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{bowler.runs}</td>
                      <td className="py-3 px-4 text-right font-bold text-red-600">{bowler.wickets}</td>
                      <td className="py-3 px-4 text-right font-semibold text-blue-600">
                        {bowler.economy.toFixed(2)}
                      </td>
                      {!isMobile && (
                        <>
                          <td className="py-3 px-4 text-right text-orange-600">{bowler.wides}</td>
                          <td className="py-3 px-4 text-right text-orange-600">{bowler.noballs}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'fow' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Fall of Wickets</h4>
              {fallOfWickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fallOfWickets.map((wicket, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-red-600 font-bold text-lg">
                          {wicket.wicket}/{wicket.runs}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({wicket.over} ov)
                        </span>
                      </div>
                      <div className="text-gray-900 font-medium mb-1">{wicket.player}</div>
                      <div className="text-gray-600 text-sm">
                        Partnership: {wicket.partnership} runs
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🏏</div>
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
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {match.innings.map((inning, index) => (
              <button
                key={index}
                onClick={() => onInningsChange(index)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  selectedInnings === index
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
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