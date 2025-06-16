'use client';

import React from 'react';
import { CricketMatch, MatchSummary, PlayerStats, BowlingStats } from '../../models/CricketMatchModel';
import { ManhattanChart, QuickStatsCards, PerformanceHighlights } from './';

interface OverviewTabContentProps {
  matchData: CricketMatch;
  matchSummary: MatchSummary;
  topBatsmen: PlayerStats[];
  topBowlers: BowlingStats[];
  generateManhattanData: (match: CricketMatch, inningsIndex: number) => Array<{
    over: number;
    runs: number;
    wickets: number;
  }>;
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ 
  matchData, 
  matchSummary, 
  topBatsmen, 
  topBowlers,
  generateManhattanData
}) => {
  return (
    <div className="space-y-8">
      {/* Match Statistics Section */}
      <section>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Match Statistics</h3>
          <p className="text-gray-600">Key performance indicators from the match</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <QuickStatsCards matchSummary={matchSummary} />
        </div>
      </section>

      {/* Run Flow Analysis Section */}
      <section>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Run Flow Analysis</h3>
          <p className="text-gray-600">Over-by-over run progression for both teams</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matchData.innings?.map((innings, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-1">{innings.team}</h4>
                <p className="text-sm text-gray-600">Runs per over progression</p>
              </div>
              <ManhattanChart
                data={generateManhattanData(matchData, index)}
                title=""
                height={280}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Performance Highlights Section */}
      <section>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Highlights</h3>
          <p className="text-gray-600">Top performers from both batting and bowling departments</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <PerformanceHighlights topBatsmen={topBatsmen} topBowlers={topBowlers} />
        </div>
      </section>

      {/* Match Summary Section */}
      <section>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Match Summary</h3>
          <p className="text-gray-600">Essential match information and outcome</p>
        </div>
        
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">Match Type</div>
              <div className="text-lg font-semibold text-gray-900">{matchData.info.match_type}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">Venue</div>
              <div className="text-lg font-semibold text-gray-900">{matchData.info.venue}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">Toss</div>
              <div className="text-lg font-semibold text-gray-900">
                {matchData.info.toss?.winner || 'N/A'}
              </div>
              {matchData.info.toss?.decision && (
                <div className="text-sm text-gray-600 mt-1">
                  chose to {matchData.info.toss.decision}
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">Result</div>
              <div className="text-lg font-semibold text-gray-900">
                {matchData.info.outcome?.winner || 'In Progress'}
              </div>
              {matchData.info.outcome?.by && (
                <div className="text-sm text-gray-600 mt-1">
                  by {matchData.info.outcome.by.runs ? `${matchData.info.outcome.by.runs} runs` : 
                       matchData.info.outcome.by.wickets ? `${matchData.info.outcome.by.wickets} wickets` : 'TBD'}
                </div>
              )}
            </div>
          </div>
          
          {matchData.info.player_of_match && matchData.info.player_of_match.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Player of the Match</div>
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
                  <span className="text-lg mr-2">🏆</span>
                  <span className="text-lg font-semibold text-blue-900">
                    {matchData.info.player_of_match[0]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}; 