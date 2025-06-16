'use client';

import React from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';

interface PowerPlayAnalysisProps {
  match: CricketMatch;
}

export const PowerPlayAnalysis: React.FC<PowerPlayAnalysisProps> = ({ match }) => {
  const analyzePowerPlay = (innings: any, teamName: string) => {
    if (!innings?.overs || innings.overs.length === 0) return null;
    
    const powerPlayOvers = innings.overs.slice(0, 6); // First 6 overs
    let runs = 0;
    let wickets = 0;
    let boundaries = 0;
    let sixes = 0;
    let dots = 0;
    let totalBalls = 0;
    
    powerPlayOvers.forEach(over => {
      over.deliveries?.forEach(delivery => {
        runs += delivery.runs?.total || 0;
        totalBalls++;
        
        if (delivery.runs?.batter === 0) dots++;
        if (delivery.runs?.batter === 4) boundaries++;
        if (delivery.runs?.batter === 6) sixes++;
        
        if (delivery.wickets) {
          wickets += delivery.wickets.length;
        }
      });
    });
    
    const runRate = totalBalls > 0 ? (runs * 6) / totalBalls : 0;
    const dotBallPercentage = totalBalls > 0 ? (dots / totalBalls) * 100 : 0;
    const boundaryPercentage = totalBalls > 0 ? ((boundaries + sixes) / totalBalls) * 100 : 0;
    
    return {
      team: teamName,
      runs,
      wickets,
      boundaries,
      sixes,
      dots,
      totalBalls,
      runRate,
      dotBallPercentage,
      boundaryPercentage,
      overs: powerPlayOvers.length
    };
  };
  
  const powerPlayData = match.innings?.map((innings, index) => 
    analyzePowerPlay(innings, innings.team)
  ).filter(Boolean) || [];
  
  if (powerPlayData.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>⚡</span>
          PowerPlay Analysis
        </h3>
        <div className="text-center py-6">
          <span className="text-gray-400 text-sm">No PowerPlay data available</span>
        </div>
      </div>
    );
  }
  
  const bestPowerPlay = powerPlayData.reduce((best, current) => 
    (current?.runRate || 0) > (best?.runRate || 0) ? current : best
  );
  
  const worstPowerPlay = powerPlayData.reduce((worst, current) => 
    (current?.runRate || 0) < (worst?.runRate || 0) ? current : worst
  );
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>⚡</span>
        PowerPlay Analysis (First 6 Overs)
      </h3>
      
      <div className="space-y-4">
        {powerPlayData.map((data, index) => (
          <div 
            key={index}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              data === bestPowerPlay 
                ? 'bg-green-500/10 border-green-500/30 ring-1 ring-green-500/20'
                : data === worstPowerPlay && powerPlayData.length > 1
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white text-sm">{data?.team}</h4>
                {data === bestPowerPlay && (
                  <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-md text-xs font-medium">
                    🏆 Best PP
                  </span>
                )}
                {data === worstPowerPlay && powerPlayData.length > 1 && (
                  <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md text-xs font-medium">
                    📉 Struggled
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {data?.runs}/{data?.wickets}
                </div>
                <div className="text-gray-300 text-xs">
                  ({data?.overs} overs)
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-base font-bold text-blue-300">
                  {data?.runRate.toFixed(1)}
                </div>
                <div className="text-gray-400 text-xs">Run Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-base font-bold text-green-300">
                  {(data?.boundaries || 0) + (data?.sixes || 0)}
                </div>
                <div className="text-gray-400 text-xs">Boundaries</div>
              </div>
              
              <div className="text-center">
                <div className="text-base font-bold text-orange-300">
                  {data?.dotBallPercentage.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs">Dot Balls</div>
              </div>
              
              <div className="text-center">
                <div className="text-base font-bold text-purple-300">
                  {data?.boundaryPercentage.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs">Boundary %</div>
              </div>
            </div>
            
            {/* Detailed breakdown */}
            <div className="mt-3 pt-3 border-t border-gray-600/30">
              <div className="flex justify-between text-xs text-gray-300">
                <span>4s: {data?.boundaries}</span>
                <span>6s: {data?.sixes}</span>
                <span>Dots: {data?.dots}/{data?.totalBalls}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Comparison insights */}
      {powerPlayData.length >= 2 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
          <h4 className="font-semibold text-cyan-300 text-sm mb-2 flex items-center gap-2">
            <span>📊</span>
            PowerPlay Comparison
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="text-cyan-200">
              <strong>Run Rate Difference:</strong> {' '}
              {Math.abs((bestPowerPlay?.runRate || 0) - (worstPowerPlay?.runRate || 0)).toFixed(1)} runs/over
            </div>
            <div className="text-cyan-200">
              <strong>Wickets Impact:</strong> {' '}
              {bestPowerPlay?.wickets === 0 ? 'No wickets lost by winner' : `${bestPowerPlay?.wickets} wickets by winner`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 