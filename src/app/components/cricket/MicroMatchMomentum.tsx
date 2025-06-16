'use client';

import React from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';

interface MomentumPoint {
  over: number;
  ball: number;
  event: string;
  runs: number;
  momentumScore: number;
  cumulativeMomentum: number;
  description: string;
  team: string;
  batter: string;
  bowler: string;
  isWicket: boolean;
}

interface OverMomentum {
  overNumber: number;
  team: string;
  totalMomentum: number;
  points: MomentumPoint[];
  netMomentumChange: number;
  keyEvent: string;
}

interface MicroMatchMomentumProps {
  match: CricketMatch;
}

export const MicroMatchMomentum: React.FC<MicroMatchMomentumProps> = ({ match }) => {
  const calculateMicroMomentum = (): OverMomentum[] => {
    const overMomentums: OverMomentum[] = [];
    let globalCumulativeMomentum = 0;
    
    match.innings?.forEach((innings, inningsIndex) => {
      innings.overs?.forEach((over, overIndex) => {
        const overNumber = overIndex + 1;
        const momentumPoints: MomentumPoint[] = [];
        let overStartMomentum = globalCumulativeMomentum;
        
        over.deliveries?.forEach((delivery, ballIndex) => {
          const ballNumber = ballIndex + 1;
          const runs = delivery.runs?.total || 0;
          const batterRuns = delivery.runs?.batter || 0;
          
          // Calculate momentum score based on weighted system
          let momentumScore = 0;
          let event = '';
          let description = '';
          
          // Wicket handling (-10 points)
          if (delivery.wickets && delivery.wickets.length > 0) {
            momentumScore = -10;
            event = 'wicket';
            description = `${delivery.wickets[0].player_out} out ${delivery.wickets[0].kind}`;
          }
          // Boundary scoring
          else if (batterRuns === 6) {
            momentumScore = 7; // +7 for six
            event = 'six';
            description = `${delivery.batter} hits a SIX!`;
          }
          else if (batterRuns === 4) {
            momentumScore = 5; // +5 for four
            event = 'four';
            description = `${delivery.batter} hits a FOUR!`;
          }
          // Double scoring (+3 points)
          else if (batterRuns === 2) {
            momentumScore = 3; // +3 for double
            event = 'double';
            description = `${delivery.batter} takes 2 runs`;
          }
          // Single scoring (+1 point)
          else if (batterRuns === 1) {
            momentumScore = 1;
            event = 'single';
            description = `${delivery.batter} takes a single`;
          }
          // Dot ball (0 points)
          else if (batterRuns === 0) {
            momentumScore = 0;
            event = 'dot';
            description = `Dot ball by ${delivery.bowler}`;
          }
          // Extras handling
          else if (runs > batterRuns) {
            momentumScore = Math.max(1, runs - batterRuns); // Extras add some momentum
            event = 'extras';
            description = `${runs - batterRuns} extras conceded`;
          }
          
          globalCumulativeMomentum += momentumScore;
          
          momentumPoints.push({
            over: overNumber,
            ball: ballNumber,
            event,
            runs: batterRuns,
            momentumScore,
            cumulativeMomentum: globalCumulativeMomentum,
            description,
            team: innings.team,
            batter: delivery.batter,
            bowler: delivery.bowler,
            isWicket: !!(delivery.wickets && delivery.wickets.length > 0)
          });
        });
        
        const overEndMomentum = globalCumulativeMomentum;
        const netMomentumChange = overEndMomentum - overStartMomentum;
        
        // Determine key event of the over
        const significantPoints = momentumPoints.filter(p => Math.abs(p.momentumScore) >= 5);
        const keyEvent = significantPoints.length > 0 
          ? significantPoints[0].event
          : momentumPoints.reduce((max, p) => Math.abs(p.momentumScore) > Math.abs(max.momentumScore) ? p : max).event;
        
        overMomentums.push({
          overNumber,
          team: innings.team,
          totalMomentum: overEndMomentum,
          points: momentumPoints,
          netMomentumChange,
          keyEvent
        });
      });
    });
    
    return overMomentums;
  };
  
  const overMomentums = calculateMicroMomentum();
  
  if (overMomentums.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>📈</span>
          Micro Match Momentum Model
        </h3>
        <div className="text-center py-6">
          <span className="text-gray-400 text-sm">No momentum data available</span>
        </div>
      </div>
    );
  }
  
  // Find momentum extremes
  const maxMomentum = Math.max(...overMomentums.map(o => o.totalMomentum));
  const minMomentum = Math.min(...overMomentums.map(o => o.totalMomentum));
  const momentumRange = maxMomentum - minMomentum;
  
  // Find biggest momentum swings
  const biggestPositiveSwing = overMomentums.reduce((max, over) => 
    over.netMomentumChange > max.netMomentumChange ? over : max
  );
  const biggestNegativeSwing = overMomentums.reduce((min, over) => 
    over.netMomentumChange < min.netMomentumChange ? over : min
  );
  
  const getEventColor = (event: string) => {
    switch (event) {
      case 'six': return 'bg-purple-500';
      case 'four': return 'bg-green-500';
      case 'wicket': return 'bg-red-500';
      case 'double': return 'bg-blue-500';
      case 'single': return 'bg-yellow-500';
      case 'extras': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getEventIcon = (event: string) => {
    switch (event) {
      case 'six': return '💥';
      case 'four': return '🏏';
      case 'wicket': return '🎯';
      case 'double': return '🏃‍♂️';
      case 'single': return '👤';
      case 'extras': return '🎁';
      default: return '⚪';
    }
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>📈</span>
        Micro Match Momentum Model
        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md">
          Ball-by-Ball Analysis
        </span>
      </h3>
      
      {/* Momentum Legend */}
      <div className="mb-4 p-3 bg-gray-700/30 rounded-xl">
        <h4 className="text-sm font-semibold text-white mb-2">Momentum Scoring System</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-purple-300">Six: +7</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-300">Four: +5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-blue-300">Double: +3</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-300">Single: +1</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-300">Wicket: -10</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-300">Dot: 0</span>
          </div>
        </div>
      </div>
      
      {/* Momentum Graph */}
      <div className="mb-6 p-4 bg-gray-700/20 rounded-xl">
        <h4 className="text-sm font-semibold text-white mb-3">Cumulative Momentum Curve</h4>
        <div className="relative h-32 bg-gray-900/50 rounded-lg overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full border-t border-gray-600/30"
                style={{ top: `${(i * 25)}%` }}
              />
            ))}
          </div>
          
          {/* Momentum line */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="url(#momentumGradient)"
              strokeWidth="2"
              points={overMomentums.map((over, index) => {
                const x = (index / (overMomentums.length - 1)) * 100;
                const normalizedMomentum = momentumRange > 0 
                  ? ((over.totalMomentum - minMomentum) / momentumRange) 
                  : 0.5;
                const y = (1 - normalizedMomentum) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
            <defs>
              <linearGradient id="momentumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Key momentum points */}
          {overMomentums.map((over, index) => {
            const significantSwing = Math.abs(over.netMomentumChange) >= 10;
            if (!significantSwing) return null;
            
            const x = (index / (overMomentums.length - 1)) * 100;
            const normalizedMomentum = momentumRange > 0 
              ? ((over.totalMomentum - minMomentum) / momentumRange) 
              : 0.5;
            const y = (1 - normalizedMomentum) * 100;
            
            return (
              <div
                key={index}
                className="absolute w-3 h-3 rounded-full bg-yellow-400 border-2 border-white transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`Over ${over.overNumber}: ${over.netMomentumChange > 0 ? '+' : ''}${over.netMomentumChange}`}
              />
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Over 1</span>
          <span>Middle Overs</span>
          <span>Over {overMomentums[overMomentums.length - 1]?.overNumber || 20}</span>
        </div>
      </div>
      
      {/* Over-by-Over Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white mb-3">Ball-by-Ball Momentum Breakdown</h4>
        
        {/* Group by innings */}
        {match.innings?.map((innings, inningsIndex) => {
          const inningsOvers = overMomentums.filter(o => o.team === innings.team);
          
          return (
            <div key={inningsIndex} className="space-y-2">
              <h5 className="text-sm font-medium text-white border-b border-gray-600/30 pb-2">
                {innings.team} - {inningsOvers.length} Overs
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {inningsOvers.map((over, overIndex) => (
                  <div
                    key={overIndex}
                    className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      over === biggestPositiveSwing && over.netMomentumChange > 0
                        ? 'bg-green-500/10 border-green-500/30 ring-1 ring-green-500/20'
                        : over === biggestNegativeSwing && over.netMomentumChange < 0
                        ? 'bg-red-500/10 border-red-500/30 ring-1 ring-red-500/20'
                        : Math.abs(over.netMomentumChange) >= 10
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-gray-700/10 border-gray-600/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">Over {over.overNumber}</span>
                        {over === biggestPositiveSwing && over.netMomentumChange > 0 && (
                          <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-md text-xs">
                            🚀 Big Swing
                          </span>
                        )}
                        {over === biggestNegativeSwing && over.netMomentumChange < 0 && (
                          <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md text-xs">
                            📉 Collapse
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          over.netMomentumChange > 0 ? 'text-green-300' : 
                          over.netMomentumChange < 0 ? 'text-red-300' : 'text-gray-300'
                        }`}>
                          {over.netMomentumChange > 0 ? '+' : ''}{over.netMomentumChange}
                        </div>
                        <div className="text-gray-400 text-xs">Momentum</div>
                      </div>
                    </div>
                    
                    {/* Ball-by-ball visualization */}
                    <div className="grid grid-cols-6 gap-1 mb-3">
                      {over.points.map((point, pointIndex) => (
                        <div
                          key={pointIndex}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${getEventColor(point.event)} transition-all duration-200 hover:scale-110`}
                          title={`Ball ${point.ball}: ${point.description} (${point.momentumScore > 0 ? '+' : ''}${point.momentumScore})`}
                        >
                          {point.isWicket ? '🎯' : point.runs > 0 ? point.runs : '•'}
                        </div>
                      ))}
                    </div>
                    
                    {/* Key event summary */}
                    <div className="text-xs text-gray-300">
                      <div className="flex items-center gap-1 mb-1">
                        <span>{getEventIcon(over.keyEvent)}</span>
                        <span className="capitalize">Key: {over.keyEvent}</span>
                      </div>
                      <div>Total Momentum: {over.totalMomentum}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Momentum Summary */}
      <div className="mt-6 p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl">
        <h4 className="font-semibold text-emerald-300 text-sm mb-2 flex items-center gap-2">
          <span>🎯</span>
          Momentum Analysis Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <div className="text-emerald-200">
            <strong>Biggest Positive Swing:</strong><br />
            Over {biggestPositiveSwing.overNumber} (+{biggestPositiveSwing.netMomentumChange})
          </div>
          <div className="text-emerald-200">
            <strong>Biggest Negative Swing:</strong><br />
            Over {biggestNegativeSwing.overNumber} ({biggestNegativeSwing.netMomentumChange})
          </div>
          <div className="text-emerald-200">
            <strong>Final Momentum:</strong><br />
            {overMomentums[overMomentums.length - 1]?.totalMomentum || 0} points
          </div>
          <div className="text-emerald-200">
            <strong>Momentum Range:</strong><br />
            {minMomentum} to {maxMomentum} ({momentumRange} span)
          </div>
        </div>
      </div>
    </div>
  );
}; 