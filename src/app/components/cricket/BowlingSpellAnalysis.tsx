'use client';

import React from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';

interface BowlingSpell {
  bowler: string;
  overs: number;
  runs: number;
  wickets: number;
  economy: number;
  startOver: number;
  endOver: number;
  phase: 'powerplay' | 'middle' | 'death';
  dotBalls: number;
  boundaries: number;
  maidens: number;
}

interface BowlingSpellAnalysisProps {
  match: CricketMatch;
}

export const BowlingSpellAnalysis: React.FC<BowlingSpellAnalysisProps> = ({ match }) => {
  const analyzeBowlingSpells = (): BowlingSpell[] => {
    const spells: BowlingSpell[] = [];
    
    match.innings?.forEach((innings, inningsIndex) => {
      const bowlerStats = new Map<string, {
        runs: number;
        wickets: number;
        overs: number;
        balls: number;
        dotBalls: number;
        boundaries: number;
        maidens: number;
        overStats: Array<{ over: number; runs: number; wickets: number; balls: number }>;
      }>();
      
      innings.overs?.forEach((over, overIndex) => {
        const overNumber = overIndex + 1;
        let mainBowler = '';
        let overRuns = 0;
        let overWickets = 0;
        let overBalls = 0;
        let overDots = 0;
        let overBoundaries = 0;
        
        over.deliveries?.forEach((delivery, ballIndex) => {
          const bowler = delivery.bowler;
          if (!mainBowler) mainBowler = bowler;
          
          const runs = delivery.runs?.total || 0;
          overRuns += runs;
          overBalls++;
          
          if (delivery.runs?.batter === 0) overDots++;
          if (delivery.runs?.batter === 4 || delivery.runs?.batter === 6) overBoundaries++;
          
          if (delivery.wickets) overWickets += delivery.wickets.length;
          
          // Update bowler stats
          if (!bowlerStats.has(bowler)) {
            bowlerStats.set(bowler, {
              runs: 0,
              wickets: 0,
              overs: 0,
              balls: 0,
              dotBalls: 0,
              boundaries: 0,
              maidens: 0,
              overStats: []
            });
          }
          
          const stats = bowlerStats.get(bowler)!;
          stats.runs += runs;
          stats.balls++;
          if (delivery.runs?.batter === 0) stats.dotBalls++;
          if (delivery.runs?.batter === 4 || delivery.runs?.batter === 6) stats.boundaries++;
          if (delivery.wickets) stats.wickets += delivery.wickets.length;
        });
        
        // Update main bowler's over stats
        if (mainBowler && bowlerStats.has(mainBowler)) {
          const stats = bowlerStats.get(mainBowler)!;
          stats.overStats.push({
            over: overNumber,
            runs: overRuns,
            wickets: overWickets,
            balls: overBalls
          });
          
          if (overRuns === 0) stats.maidens++;
        }
      });
      
      // Convert to spells
      bowlerStats.forEach((stats, bowler) => {
        if (stats.balls >= 6) { // At least one over
          const overs = Math.floor(stats.balls / 6) + (stats.balls % 6) / 10;
          const economy = overs > 0 ? stats.runs / overs : 0;
          
          // Determine phase based on when they bowled most
          let phase: 'powerplay' | 'middle' | 'death' = 'middle';
          const firstOver = stats.overStats[0]?.over || 1;
          const lastOver = stats.overStats[stats.overStats.length - 1]?.over || 1;
          
          if (firstOver <= 6 && lastOver <= 10) {
            phase = 'powerplay';
          } else if (lastOver >= 16 || (firstOver >= 16)) {
            phase = 'death';
          }
          
          spells.push({
            bowler,
            overs,
            runs: stats.runs,
            wickets: stats.wickets,
            economy,
            startOver: firstOver,
            endOver: lastOver,
            phase,
            dotBalls: stats.dotBalls,
            boundaries: stats.boundaries,
            maidens: stats.maidens
          });
        }
      });
    });
    
    return spells.sort((a, b) => {
      // Sort by wickets first, then by economy
      if (a.wickets !== b.wickets) return b.wickets - a.wickets;
      return a.economy - b.economy;
    });
  };
  
  const bowlingSpells = analyzeBowlingSpells();
  
  if (bowlingSpells.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>⚾</span>
          Bowling Spell Analysis
        </h3>
        <div className="text-center py-6">
          <span className="text-gray-400 text-sm">No bowling data available</span>
        </div>
      </div>
    );
  }
  
  const bestEconomySpell = bowlingSpells.filter(s => s.overs >= 3).reduce((best, current) => 
    current.economy < best.economy ? current : best, bowlingSpells[0]
  );
  
  const bestWicketTaker = bowlingSpells.reduce((best, current) => 
    current.wickets > best.wickets ? current : best, bowlingSpells[0]
  );
  
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'powerplay': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'middle': return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'death': return 'bg-red-500/20 border-red-500/30 text-red-300';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };
  
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'powerplay': return '⚡';
      case 'middle': return '🎯';
      case 'death': return '🔥';
      default: return '⚾';
    }
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>⚾</span>
        Bowling Spell Analysis
      </h3>
      
      <div className="space-y-3">
        {bowlingSpells.map((spell, index) => (
          <div 
            key={index}
            className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
              spell === bestWicketTaker && spell.wickets >= 3
                ? 'bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/20'
                : spell === bestEconomySpell && spell.overs >= 3
                ? 'bg-green-500/10 border-green-500/30 ring-1 ring-green-500/20'
                : getPhaseColor(spell.phase)
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getPhaseIcon(spell.phase)}</span>
                <div>
                  <h4 className="font-semibold text-white text-sm">{spell.bowler}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 capitalize">{spell.phase} phase</span>
                    {spell === bestWicketTaker && spell.wickets >= 3 && (
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md text-xs font-medium">
                        🏆 Best Figures
                      </span>
                    )}
                    {spell === bestEconomySpell && spell.overs >= 3 && (
                      <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-md text-xs font-medium">
                        💎 Most Economical
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {spell.wickets}/{spell.runs}
                </div>
                <div className="text-gray-300 text-xs">
                  ({spell.overs} overs)
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="text-center">
                <div className="text-sm font-bold text-blue-300">
                  {spell.economy.toFixed(2)}
                </div>
                <div className="text-gray-400 text-xs">Economy</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-bold text-green-300">
                  {spell.dotBalls}
                </div>
                <div className="text-gray-400 text-xs">Dots</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-bold text-orange-300">
                  {spell.boundaries}
                </div>
                <div className="text-gray-400 text-xs">Boundaries</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-bold text-purple-300">
                  {spell.maidens}
                </div>
                <div className="text-gray-400 text-xs">Maidens</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-bold text-cyan-300">
                  {spell.startOver}-{spell.endOver}
                </div>
                <div className="text-gray-400 text-xs">Over Range</div>
              </div>
            </div>
            
            {/* Effectiveness meter */}
            <div className="mt-3 pt-3 border-t border-gray-600/30">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-300">Effectiveness:</span>
                <div className="flex-1 bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      spell.economy <= 4 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : spell.economy <= 7
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100 - (spell.economy * 8), 100)}%`
                    }}
                  />
                </div>
                <span className={`text-xs ${
                  spell.economy <= 4 ? 'text-green-300' : 
                  spell.economy <= 7 ? 'text-yellow-300' : 'text-red-300'
                }`}>
                  {spell.economy <= 4 ? 'Excellent' : spell.economy <= 7 ? 'Good' : 'Expensive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Bowling insights */}
      <div className="mt-4 p-3 bg-gradient-to-r from-slate-500/10 to-gray-500/10 border border-slate-500/30 rounded-xl">
        <h4 className="font-semibold text-slate-300 text-sm mb-2 flex items-center gap-2">
          <span>📊</span>
          Bowling Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="text-slate-200">
            <strong>Best Bowling:</strong> {bestWicketTaker.bowler} ({bestWicketTaker.wickets}/{bestWicketTaker.runs})
          </div>
          <div className="text-slate-200">
            <strong>Most Economical:</strong> {bestEconomySpell.bowler} ({bestEconomySpell.economy.toFixed(2)})
          </div>
          <div className="text-slate-200">
            <strong>Total Maidens:</strong> {bowlingSpells.reduce((sum, s) => sum + s.maidens, 0)}
          </div>
          <div className="text-slate-200">
            <strong>Avg Economy:</strong> {(bowlingSpells.reduce((sum, s) => sum + s.economy, 0) / bowlingSpells.length).toFixed(2)}
          </div>
        </div>
        
        {/* Phase breakdown */}
        <div className="mt-2 pt-2 border-t border-slate-600/30">
          <div className="flex justify-between text-xs text-slate-200">
            <span>PowerPlay: {bowlingSpells.filter(s => s.phase === 'powerplay').length} spells</span>
            <span>Middle: {bowlingSpells.filter(s => s.phase === 'middle').length} spells</span>
            <span>Death: {bowlingSpells.filter(s => s.phase === 'death').length} spells</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 