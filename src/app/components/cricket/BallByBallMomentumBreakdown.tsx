'use client';

import React, { useMemo } from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';

interface BallByBallMomentumBreakdownProps {
  match: CricketMatch;
}

interface DeliveryMomentum {
  over: number;
  ball: number;
  team: string;
  runs: number;
  wicket: boolean;
  boundaryType: 'none' | 'four' | 'six';
  momentumChange: number;
  cumulativeMomentum: number;
  description: string;
  batter?: string;
  bowler?: string;
  extras?: string;
}

export const BallByBallMomentumBreakdown: React.FC<BallByBallMomentumBreakdownProps> = ({ match }) => {
  const ballByBallData = useMemo(() => {
    const deliveries: DeliveryMomentum[] = [];
    let cumulativeMomentum = 0;

    match.innings?.forEach((innings, inningsIndex) => {
      innings.overs.forEach((over, overIndex) => {
        over.deliveries.forEach((delivery, deliveryIndex) => {
          const runs = delivery.runs.batter;
          const totalRuns = delivery.runs.total;
          const hasWicket = delivery.wickets && delivery.wickets.length > 0;
          
          // Calculate momentum change based on weighted scoring
          let momentumChange = 0;
          
          if (hasWicket) {
            momentumChange = -10; // Major negative momentum for wickets
          } else if (runs === 6) {
            momentumChange = 7; // High positive momentum for sixes
          } else if (runs === 4) {
            momentumChange = 5; // Good positive momentum for fours
          } else if (runs === 2 || runs === 3) {
            momentumChange = 3; // Moderate positive momentum for doubles/triples
          } else if (runs === 1) {
            momentumChange = 1; // Small positive momentum for singles
          } else if (runs === 0) {
            momentumChange = -1; // Small negative momentum for dots
          }

          // Additional momentum for extras
          if (delivery.runs.extras > 0) {
            momentumChange += delivery.runs.extras * 0.5;
          }

          cumulativeMomentum += momentumChange;

          // Determine boundary type
          let boundaryType: 'none' | 'four' | 'six' = 'none';
          if (runs === 4) boundaryType = 'four';
          if (runs === 6) boundaryType = 'six';

          // Create description
          let description = '';
          if (hasWicket) {
            const wicket = delivery.wickets![0];
            description = `WICKET! ${wicket.player_out} ${wicket.kind}`;
          } else if (runs === 6) {
            description = `SIX! ${runs} runs`;
          } else if (runs === 4) {
            description = `FOUR! ${runs} runs`;
          } else if (runs === 0) {
            description = 'Dot ball';
          } else {
            description = `${runs} run${runs > 1 ? 's' : ''}`;
          }

          // Add extras description
          if (delivery.runs.extras > 0 && delivery.extras) {
            const extrasTypes = [];
            if (delivery.extras.wides) extrasTypes.push('wide');
            if (delivery.extras.byes) extrasTypes.push('bye');
            if (delivery.extras.legbyes) extrasTypes.push('leg-bye');
            if (delivery.extras.noballs) extrasTypes.push('no-ball');
            
            if (extrasTypes.length > 0) {
              description += ` + ${extrasTypes.join(', ')}`;
            }
          }

          deliveries.push({
            over: overIndex + 1,
            ball: deliveryIndex + 1,
            team: innings.team,
            runs: totalRuns,
            wicket: hasWicket,
            boundaryType,
            momentumChange,
            cumulativeMomentum,
            description,
            batter: delivery.batter,
            bowler: delivery.bowler,
            extras: delivery.runs.extras > 0 ? `+${delivery.runs.extras}` : undefined
          });
        });
      });
    });

    return deliveries;
  }, [match]);

  // Group deliveries by over for better organization
  const groupedByOver = useMemo(() => {
    const grouped: { [key: string]: DeliveryMomentum[] } = {};
    
    ballByBallData.forEach(delivery => {
      const key = `${delivery.team}-Over-${delivery.over}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(delivery);
    });

    return grouped;
  }, [ballByBallData]);

  const getMomentumColor = (change: number) => {
    if (change >= 5) return 'text-green-400 bg-green-500/20';
    if (change >= 1) return 'text-emerald-400 bg-emerald-500/20';
    if (change === 0) return 'text-slate-400 bg-slate-500/20';
    if (change >= -3) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getBallIcon = (delivery: DeliveryMomentum) => {
    if (delivery.wicket) return '🔴';
    if (delivery.boundaryType === 'six') return '🟣';
    if (delivery.boundaryType === 'four') return '🟢';
    if (delivery.runs === 0) return '⚫';
    return '🔵';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
          <span className="text-xl">⚡</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Ball-by-Ball Momentum Breakdown</h3>
          <p className="text-slate-400 text-sm">Detailed delivery-wise momentum analysis</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
        <h4 className="text-sm font-semibold text-white mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span>🔴</span>
            <span className="text-slate-300">Wicket (-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟣</span>
            <span className="text-slate-300">Six (+7)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟢</span>
            <span className="text-slate-300">Four (+5)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔵</span>
            <span className="text-slate-300">Runs (+1-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚫</span>
            <span className="text-slate-300">Dot (-1)</span>
          </div>
        </div>
      </div>

      {/* Ball-by-Ball Data in Columns */}
      <div className="space-y-6">
        {Object.entries(groupedByOver).map(([overKey, deliveries]) => {
          const teamName = deliveries[0].team;
          const overNumber = deliveries[0].over;
          const overRuns = deliveries.reduce((sum, d) => sum + d.runs, 0);
          const overWickets = deliveries.filter(d => d.wicket).length;
          const overMomentum = deliveries.reduce((sum, d) => sum + d.momentumChange, 0);

          return (
            <div key={overKey} className="bg-slate-700/20 rounded-xl border border-slate-600/30 overflow-hidden">
              {/* Over Header */}
              <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 p-4 border-b border-slate-600/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {teamName} - Over {overNumber}
                    </h4>
                    <p className="text-slate-300 text-sm">
                      {overRuns} runs, {overWickets} wicket{overWickets !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold ${getMomentumColor(overMomentum)}`}>
                    {overMomentum > 0 ? '+' : ''}{overMomentum}
                  </div>
                </div>
              </div>

              {/* Deliveries Grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {deliveries.map((delivery, index) => (
                    <div
                      key={`${overKey}-${index}`}
                      className="bg-slate-800/50 rounded-lg border border-slate-600/30 p-3 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      {/* Ball Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getBallIcon(delivery)}</span>
                          <span className="text-sm font-semibold text-white">
                            Ball {delivery.ball}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${getMomentumColor(delivery.momentumChange)}`}>
                          {delivery.momentumChange > 0 ? '+' : ''}{delivery.momentumChange}
                        </div>
                      </div>

                      {/* Ball Details */}
                      <div className="space-y-1">
                        <div className="text-sm text-white font-medium">
                          {delivery.description}
                        </div>
                        
                        {delivery.batter && (
                          <div className="text-xs text-slate-400">
                            Batter: {delivery.batter}
                          </div>
                        )}
                        
                        {delivery.bowler && (
                          <div className="text-xs text-slate-400">
                            Bowler: {delivery.bowler}
                          </div>
                        )}

                        {delivery.extras && (
                          <div className="text-xs text-yellow-400">
                            Extras: {delivery.extras}
                          </div>
                        )}

                        {/* Cumulative Momentum */}
                        <div className="text-xs text-slate-500 pt-1 border-t border-slate-600/30">
                          Total Momentum: {delivery.cumulativeMomentum}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
        <h4 className="text-sm font-semibold text-white mb-3">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {ballByBallData.filter(d => d.boundaryType === 'six').length}
            </div>
            <div className="text-slate-400">Sixes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">
              {ballByBallData.filter(d => d.boundaryType === 'four').length}
            </div>
            <div className="text-slate-400">Fours</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {ballByBallData.filter(d => d.wicket).length}
            </div>
            <div className="text-slate-400">Wickets</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-400">
              {ballByBallData.filter(d => d.runs === 0).length}
            </div>
            <div className="text-slate-400">Dot Balls</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 