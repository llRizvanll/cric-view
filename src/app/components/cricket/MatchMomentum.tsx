'use client';

import React from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';

interface MomentumEvent {
  over: number;
  ball: number;
  event: string;
  impact: number; // -3 to +3, negative = bowling advantage, positive = batting advantage
  description: string;
  team: string;
  runs: number;
  wickets: number;
}

interface MatchMomentumProps {
  match: CricketMatch;
}

export const MatchMomentum: React.FC<MatchMomentumProps> = ({ match }) => {
  const analyzeMomentum = (): MomentumEvent[] => {
    const events: MomentumEvent[] = [];
    
    match.innings?.forEach((innings, inningsIndex) => {
      let cumulativeRuns = 0;
      let cumulativeWickets = 0;
      
      innings.overs?.forEach((over, overIndex) => {
        let overRuns = 0;
        let overWickets = 0;
        
        over.deliveries?.forEach((delivery, ballIndex) => {
          const runs = delivery.runs?.total || 0;
          cumulativeRuns += runs;
          overRuns += runs;
          
          // Boundary events
          if (delivery.runs?.batter === 6) {
            events.push({
              over: overIndex + 1,
              ball: ballIndex + 1,
              event: 'six',
              impact: 2,
              description: `${delivery.batter} hits a SIX!`,
              team: innings.team,
              runs: cumulativeRuns,
              wickets: cumulativeWickets
            });
          } else if (delivery.runs?.batter === 4) {
            events.push({
              over: overIndex + 1,
              ball: ballIndex + 1,
              event: 'four',
              impact: 1,
              description: `${delivery.batter} hits a FOUR!`,
              team: innings.team,
              runs: cumulativeRuns,
              wickets: cumulativeWickets
            });
          }
          
          // Wicket events
          if (delivery.wickets && delivery.wickets.length > 0) {
            cumulativeWickets += delivery.wickets.length;
            overWickets += delivery.wickets.length;
            
            delivery.wickets.forEach(wicket => {
              const impact = cumulativeWickets <= 3 ? -1 : cumulativeWickets <= 6 ? -2 : -3;
              events.push({
                over: overIndex + 1,
                ball: ballIndex + 1,
                event: 'wicket',
                impact,
                description: `${wicket.player_out} out ${wicket.kind}`,
                team: innings.team,
                runs: cumulativeRuns,
                wickets: cumulativeWickets
              });
            });
          }
        });
        
        // Over analysis
        if (overRuns >= 15) {
          events.push({
            over: overIndex + 1,
            ball: 6,
            event: 'big_over',
            impact: 2,
            description: `Massive over! ${overRuns} runs scored`,
            team: innings.team,
            runs: cumulativeRuns,
            wickets: cumulativeWickets
          });
        } else if (overRuns === 0 && overWickets > 0) {
          events.push({
            over: overIndex + 1,
            ball: 6,
            event: 'maiden_wicket',
            impact: -2,
            description: `Maiden over with wicket!`,
            team: innings.team,
            runs: cumulativeRuns,
            wickets: cumulativeWickets
          });
        }
      });
    });
    
    return events.sort((a, b) => {
      if (a.team !== b.team) {
        // Sort by innings order (team batting first comes first)
        const aInningsIndex = match.innings?.findIndex(i => i.team === a.team) || 0;
        const bInningsIndex = match.innings?.findIndex(i => i.team === b.team) || 0;
        return aInningsIndex - bInningsIndex;
      }
      // Within same innings, sort by over then ball
      if (a.over !== b.over) return a.over - b.over;
      return a.ball - b.ball;
    });
  };
  
  const momentumEvents = analyzeMomentum();
  
  if (momentumEvents.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>📊</span>
          Match Momentum
        </h3>
        <div className="text-center py-6">
          <span className="text-gray-400 text-sm">No momentum events detected</span>
        </div>
      </div>
    );
  }
  
  // Group events by innings
  const eventsByInnings = match.innings?.map(innings => ({
    team: innings.team,
    events: momentumEvents.filter(event => event.team === innings.team)
  })) || [];
  
  const getEventColor = (event: MomentumEvent) => {
    switch (event.event) {
      case 'six': return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      case 'four': return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'wicket': return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'big_over': return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
      case 'maiden_wicket': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };
  
  const getEventIcon = (event: MomentumEvent) => {
    switch (event.event) {
      case 'six': return '💥';
      case 'four': return '🏏';
      case 'wicket': return '🎯';
      case 'big_over': return '🔥';
      case 'maiden_wicket': return '🛡️';
      default: return '📊';
    }
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>📊</span>
        Match Momentum & Key Events
      </h3>
      
      <div className="space-y-6">
        {eventsByInnings.map((inningsData, inningsIndex) => (
          <div key={inningsIndex} className="space-y-3">
            <h4 className="font-semibold text-white text-sm border-b border-gray-600/30 pb-2 flex items-center gap-2">
              <span>{inningsData.team}</span>
              <span className="text-gray-400 text-xs">({inningsData.events.length} key moments)</span>
            </h4>
            
            {inningsData.events.length === 0 ? (
              <div className="text-center py-4">
                <span className="text-gray-400 text-sm">No significant momentum shifts</span>
              </div>
            ) : (
              <div className="space-y-2">
                {inningsData.events.map((event, eventIndex) => (
                  <div 
                    key={eventIndex}
                    className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${getEventColor(event)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getEventIcon(event)}</span>
                        <div>
                          <div className="font-medium text-sm">{event.description}</div>
                          <div className="text-xs opacity-75">
                            Over {event.over}.{event.ball}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {event.runs}/{event.wickets}
                        </div>
                        <div className="text-xs opacity-75">
                          Impact: {event.impact > 0 ? '+' : ''}{event.impact}
                        </div>
                      </div>
                    </div>
                    
                    {/* Momentum indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Momentum:</span>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            event.impact > 0 
                              ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                              : 'bg-gradient-to-r from-red-500 to-orange-500'
                          }`}
                          style={{ 
                            width: `${Math.min(Math.abs(event.impact) * 33.33, 100)}%`,
                            marginLeft: event.impact < 0 ? 'auto' : '0'
                          }}
                        />
                      </div>
                      <span className="text-xs">
                        {event.impact > 0 ? '🏏 Batting' : '⚾ Bowling'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Overall momentum summary */}
      <div className="mt-6 p-3 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl">
        <h4 className="font-semibold text-teal-300 text-sm mb-2 flex items-center gap-2">
          <span>🎯</span>
          Momentum Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="text-teal-200">
            <strong>Total Key Events:</strong> {momentumEvents.length}
          </div>
          <div className="text-teal-200">
            <strong>Boundaries Hit:</strong> {momentumEvents.filter(e => e.event === 'four' || e.event === 'six').length}
          </div>
          <div className="text-teal-200">
            <strong>Crucial Wickets:</strong> {momentumEvents.filter(e => e.event === 'wicket').length}
          </div>
        </div>
        
                 {/* Match turning point */}
         {(() => {
           if (momentumEvents.length === 0) return null;
           
           const biggestMomentum = momentumEvents.reduce((max, event) => 
             Math.abs(event.impact) > Math.abs(max.impact) ? event : max,
             momentumEvents[0]
           );
           
           return biggestMomentum && Math.abs(biggestMomentum.impact) >= 2 && (
             <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
               <div className="text-yellow-300 text-xs">
                 <strong>🔄 Match Turning Point:</strong> {biggestMomentum.description} (Over {biggestMomentum.over}.{biggestMomentum.ball})
               </div>
             </div>
           );
         })()}
      </div>
    </div>
  );
}; 