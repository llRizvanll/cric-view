'use client';

import React from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';

interface Partnership {
  batter1: string;
  batter2: string;
  runs: number;
  balls: number;
  wicket: number;
  runRate: number;
  boundaries: number;
  sixes: number;
}

interface PartnershipBreakdownProps {
  match: CricketMatch;
}

export const PartnershipBreakdown: React.FC<PartnershipBreakdownProps> = ({ match }) => {
  const analyzePartnerships = (innings: any, teamName: string) => {
    if (!innings?.overs || innings.overs.length === 0) return [];
    
    const partnerships: Partnership[] = [];
    let currentBatter1 = '';
    let currentBatter2 = '';
    let partnershipRuns = 0;
    let partnershipBalls = 0;
    let partnershipBoundaries = 0;
    let partnershipSixes = 0;
    let wicketNumber = 0;
    
    innings.overs.forEach(over => {
      over.deliveries?.forEach(delivery => {
        const striker = delivery.batter;
        const nonStriker = delivery.non_striker;
        
        // Initialize partnership if it's the first ball or after a wicket
        if (!currentBatter1 || !currentBatter2) {
          currentBatter1 = striker;
          currentBatter2 = nonStriker;
        }
        
        // Check if partnership changed (new batsman)
        if (striker !== currentBatter1 && striker !== currentBatter2) {
          // Save previous partnership if it had substance
          if (partnershipRuns > 0 || partnershipBalls > 5) {
            partnerships.push({
              batter1: currentBatter1,
              batter2: currentBatter2,
              runs: partnershipRuns,
              balls: partnershipBalls,
              wicket: wicketNumber,
              runRate: partnershipBalls > 0 ? (partnershipRuns * 6) / partnershipBalls : 0,
              boundaries: partnershipBoundaries,
              sixes: partnershipSixes
            });
          }
          
          // Start new partnership
          currentBatter1 = striker;
          currentBatter2 = nonStriker;
          partnershipRuns = 0;
          partnershipBalls = 0;
          partnershipBoundaries = 0;
          partnershipSixes = 0;
          wicketNumber++;
        }
        
        // Add to current partnership
        partnershipRuns += delivery.runs?.total || 0;
        partnershipBalls++;
        
        if (delivery.runs?.batter === 4) partnershipBoundaries++;
        if (delivery.runs?.batter === 6) partnershipSixes++;
        
        // Handle wicket
        if (delivery.wickets && delivery.wickets.length > 0) {
          // Save partnership before wicket
          partnerships.push({
            batter1: currentBatter1,
            batter2: currentBatter2,
            runs: partnershipRuns,
            balls: partnershipBalls,
            wicket: wicketNumber + 1,
            runRate: partnershipBalls > 0 ? (partnershipRuns * 6) / partnershipBalls : 0,
            boundaries: partnershipBoundaries,
            sixes: partnershipSixes
          });
          
          // Reset for next partnership
          partnershipRuns = 0;
          partnershipBalls = 0;
          partnershipBoundaries = 0;
          partnershipSixes = 0;
          wicketNumber++;
          
          // The non-striker continues, new batsman comes in
          currentBatter1 = nonStriker;
          currentBatter2 = ''; // Will be set when new batsman faces
        }
      });
    });
    
    // Add final partnership if innings ended without wicket
    if (partnershipRuns > 0 || partnershipBalls > 5) {
      partnerships.push({
        batter1: currentBatter1,
        batter2: currentBatter2,
        runs: partnershipRuns,
        balls: partnershipBalls,
        wicket: wicketNumber + 1,
        runRate: partnershipBalls > 0 ? (partnershipRuns * 6) / partnershipBalls : 0,
        boundaries: partnershipBoundaries,
        sixes: partnershipSixes
      });
    }
    
    return partnerships;
  };
  
  const allPartnerships = match.innings?.map((innings, index) => ({
    team: innings.team,
    partnerships: analyzePartnerships(innings, innings.team)
  })).filter(teamData => teamData.partnerships.length > 0) || [];
  
  if (allPartnerships.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>🤝</span>
          Partnership Breakdown
        </h3>
        <div className="text-center py-6">
          <span className="text-gray-400 text-sm">No partnership data available</span>
        </div>
      </div>
    );
  }
  
  // Find the highest partnership across all teams
  const allPartnershipsList = allPartnerships.flatMap(team => team.partnerships);
  const highestPartnership = allPartnershipsList.reduce((max, current) => 
    current.runs > max.runs ? current : max, allPartnershipsList[0]
  );
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>🤝</span>
        Partnership Breakdown
      </h3>
      
      <div className="space-y-4">
        {allPartnerships.map((teamData, teamIndex) => (
          <div key={teamIndex} className="space-y-3">
            <h4 className="font-semibold text-white text-sm border-b border-gray-600/30 pb-2">
              {teamData.team}
            </h4>
            
            <div className="space-y-2">
              {teamData.partnerships
                .sort((a, b) => b.runs - a.runs) // Sort by runs, highest first
                .map((partnership, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    partnership === highestPartnership
                      ? 'bg-yellow-500/10 border-yellow-500/30 ring-1 ring-yellow-500/20'
                      : partnership.runs >= 50
                      ? 'bg-green-500/10 border-green-500/30'
                      : partnership.runs >= 25
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-gray-700/10 border-gray-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">
                        {partnership.batter1} & {partnership.batter2}
                      </span>
                      {partnership === highestPartnership && (
                        <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-md text-xs font-medium">
                          🏆 Highest
                        </span>
                      )}
                      {partnership.runs >= 100 && (
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md text-xs font-medium">
                          💯 Century
                        </span>
                      )}
                      {partnership.runs >= 50 && partnership.runs < 100 && (
                        <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-md text-xs font-medium">
                          50+ Partnership
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-white">
                        {partnership.runs} runs
                      </div>
                      <div className="text-gray-300 text-xs">
                        Wicket #{partnership.wicket}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-300">
                        {partnership.runRate.toFixed(1)}
                      </div>
                      <div className="text-gray-400 text-xs">Run Rate</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-300">
                        {partnership.balls}
                      </div>
                      <div className="text-gray-400 text-xs">Balls</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-bold text-orange-300">
                        {partnership.boundaries}
                      </div>
                      <div className="text-gray-400 text-xs">Fours</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-bold text-purple-300">
                        {partnership.sixes}
                      </div>
                      <div className="text-gray-400 text-xs">Sixes</div>
                    </div>
                  </div>
                  
                  {/* Partnership contribution percentage */}
                  <div className="mt-2 pt-2 border-t border-gray-600/20">
                    <div className="text-xs text-gray-300">
                      {partnership.boundaries + partnership.sixes > 0 && (
                        <span>
                          Boundaries: {((partnership.boundaries * 4 + partnership.sixes * 6) / partnership.runs * 100).toFixed(1)}% of runs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Partnership insights */}
      {allPartnershipsList.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl">
          <h4 className="font-semibold text-indigo-300 text-sm mb-2 flex items-center gap-2">
            <span>📈</span>
            Partnership Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="text-indigo-200">
              <strong>Highest Partnership:</strong> {' '}
              {highestPartnership.runs} runs ({highestPartnership.batter1} & {highestPartnership.batter2})
            </div>
            <div className="text-indigo-200">
              <strong>Century Partnerships:</strong> {' '}
              {allPartnershipsList.filter(p => p.runs >= 100).length}
            </div>
            <div className="text-indigo-200">
              <strong>50+ Partnerships:</strong> {' '}
              {allPartnershipsList.filter(p => p.runs >= 50).length}
            </div>
            <div className="text-indigo-200">
              <strong>Average Partnership:</strong> {' '}
              {(allPartnershipsList.reduce((sum, p) => sum + p.runs, 0) / allPartnershipsList.length).toFixed(1)} runs
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 