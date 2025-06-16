'use client';

import React, { useEffect, useState } from 'react';
import { CricketMatch, MatchSummary, PlayerStats, BowlingStats } from '../../models/CricketMatchModel';
import { CricketAnalyticsViewModel } from '../../viewmodels/CricketAnalyticsViewModel';

// Import components
import { 
  // Core components
  MatchHeader, 
  ScoreCard, 
  PlayerCard, 
  LiveCommentary, 
  StatsComparison, 
  ManhattanChart, 
  OverByOverCard, 
  BarChart, 
  LineChart, 
  PieChart, 
  PlayersStatsGrid,
  // Modular UI components
  LoadingState,
  ErrorState,
  NavigationHeader,
  TabNavigation,
  TabType,
  InningsSelector,
  // Tab content components
  OverviewTabContent,
  BattingTabContent,
  BowlingTabContent,
  // New cricket analysis components
  CricketInsights,
  PowerPlayAnalysis,
  PartnershipBreakdown,
  BowlingSpellAnalysis,
  MatchMomentum
} from '../../components/cricket';

interface EnhancedMatchAnalyticsScreenProps {
  matchId?: string;
}

export const EnhancedMatchAnalyticsScreen: React.FC<EnhancedMatchAnalyticsScreenProps> = ({ 
  matchId = '1448347' 
}) => {
  const [matchData, setMatchData] = useState<CricketMatch | null>(null);
  const [viewModel, setViewModel] = useState<CricketAnalyticsViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedInnings, setSelectedInnings] = useState(0);

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/matches/${matchId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch match data`);
        }
        
        const data: CricketMatch = await response.json();
        setMatchData(data);
        
        const analytics = new CricketAnalyticsViewModel(data);
        setViewModel(analytics);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load match data';
        setError(errorMessage);
        console.error('Error loading match data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      loadMatchData();
    }
  }, [matchId]);

  // Generate Manhattan chart data
  const generateManhattanData = (match: CricketMatch, inningsIndex: number) => {
    if (!match.innings?.[inningsIndex]) return [];
    
    const innings = match.innings[inningsIndex];
    return innings.overs.map((over, index) => {
      let runs = 0;
      let wickets = 0;
      
      over.deliveries.forEach(delivery => {
        runs += delivery.runs.total;
        if (delivery.wickets) wickets += delivery.wickets.length;
      });
      
      return {
        over: index + 1,
        runs,
        wickets
      };
    });
  };

  if (loading) {
    return <LoadingState matchId={matchId} />;
  }

  if (error || !matchData || !viewModel) {
    return <ErrorState error={error || 'No match data available'} matchId={matchId} />;
  }

  const matchSummary = viewModel.getMatchSummary();
  const topBatsmen = viewModel.getTopBatsmen(6);
  const topBowlers = viewModel.getTopBowlers(6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-3 py-4 space-y-3">
        {/* Compact Navigation */}
        <div className="flex items-center justify-between py-2 px-3 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
          >
            <span className="text-sm">←</span>
            <span className="text-xs font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 rounded-lg">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-xs font-medium">Live</span>
            </div>
            <span className="text-gray-400 text-xs font-mono">{matchId}</span>
          </div>
        </div>

        {/* Compact Match Header */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="p-3">
            {/* Teams Header */}
            <div className="text-center mb-3">
              <h1 className="text-xl font-bold text-white mb-0.5">
                {matchData.info.teams.join(' vs ')}
              </h1>
              <div className="text-gray-400 text-xs">
                {matchData.info.event && (
                  typeof matchData.info.event === 'string' 
                    ? matchData.info.event 
                    : matchData.info.event.name
                )}
              </div>
            </div>
            
            {/* Match Result */}
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1.5">
                <span className="text-sm">🏆</span>
                <div className="text-white font-medium text-xs">
                  {(() => {
                    const outcome = matchData.info.outcome;
                    if (outcome?.winner) {
                      let resultText = `${outcome.winner} won`;
                      if (outcome.by?.runs) {
                        resultText += ` by ${outcome.by.runs} runs`;
                      } else if (outcome.by?.wickets) {
                        resultText += ` by ${outcome.by.wickets} wickets`;
                      }
                      return resultText;
                    }
                    return outcome?.result || 'Match completed';
                  })()}
                </div>
              </div>
            </div>

            {/* Compact Match Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-gray-700/30 rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs">📅</span>
                  <span className="text-gray-300 text-xs font-medium">Date</span>
                </div>
                <div className="text-white text-xs">
                  {matchData.info.dates?.[0] ? new Date(matchData.info.dates[0]).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'TBD'}
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs">📍</span>
                  <span className="text-gray-300 text-xs font-medium">Venue</span>
                </div>
                <div className="text-white text-xs truncate">
                  {matchData.info.venue}
                  {matchData.info.city && `, ${matchData.info.city}`}
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs">🏏</span>
                  <span className="text-gray-300 text-xs font-medium">Format</span>
                </div>
                <div className="text-white text-xs">
                  {matchData.info.match_type}
                </div>
              </div>
            </div>

            {/* Additional Info Pills */}
            {(matchData.info.season || matchData.info.player_of_match || matchData.info.toss) && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {matchData.info.season && (
                  <span className="bg-blue-500/20 px-2 py-0.5 rounded-md text-blue-300 text-xs">
                    Season {matchData.info.season}
                  </span>
                )}
                
                {matchData.info.player_of_match && (
                  <span className="bg-yellow-500/20 px-2 py-0.5 rounded-md text-yellow-300 text-xs">
                    🏆 {Array.isArray(matchData.info.player_of_match) 
                      ? matchData.info.player_of_match[0] 
                      : matchData.info.player_of_match}
                  </span>
                )}
                
                {matchData.info.toss && (
                  <span className="bg-purple-500/20 px-2 py-0.5 rounded-md text-purple-300 text-xs">
                    Toss: {matchData.info.toss.winner}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Compact Score Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {matchData.innings?.map((innings, index) => {
            // Calculate innings stats inline
            let totalRuns = 0;
            let totalWickets = 0;
            let totalBalls = 0;
            let boundaries = 0;
            let sixes = 0;

            innings.overs.forEach(over => {
              over.deliveries.forEach(delivery => {
                totalRuns += delivery.runs.total;
                totalBalls++;
                
                if (delivery.runs.batter === 4) boundaries++;
                if (delivery.runs.batter === 6) sixes++;
                
                if (delivery.wickets) {
                  totalWickets += delivery.wickets.length;
                }
              });
            });

            const overs = Math.floor(totalBalls / 6);
            const balls = totalBalls % 6;
            const runRate = totalBalls > 0 ? (totalRuns * 6) / totalBalls : 0;

            return (
              <div key={index} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden group hover:border-gray-600/50 transition-all duration-300">
                {/* Compact Team Header */}
                <div className={`p-3 bg-gradient-to-r ${index === 0 ? 'from-blue-600/20 to-blue-700/20' : 'from-green-600/20 to-green-700/20'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">{innings.team}</h3>
                      <span className="text-gray-300 text-xs">Innings {index + 1}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {totalRuns}/{totalWickets}
                      </div>
                      <div className="text-gray-300 text-xs">
                        ({overs}.{balls} ov)
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Compact Stats */}
                <div className="p-3">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-base font-bold text-blue-300">{runRate.toFixed(1)}</div>
                      <div className="text-gray-400 text-xs">Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-bold text-green-300">{boundaries}</div>
                      <div className="text-gray-400 text-xs">4s</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-bold text-purple-300">{sixes}</div>
                      <div className="text-gray-400 text-xs">6s</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-bold text-red-300">{totalWickets}</div>
                      <div className="text-gray-400 text-xs">Wkts</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Comparison */}
        {matchSummary.teamStats.length >= 2 && (
          <StatsComparison teamStats={matchSummary.teamStats} />
        )}

        {/* Compact Tab Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-0.5">
          <div className="flex flex-wrap gap-0.5">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'players', label: 'Players', icon: '👥' },
              { id: 'batting', label: 'Batting', icon: '🏏' },
              { id: 'bowling', label: 'Bowling', icon: '⚾' },
              { id: 'overs', label: 'Overs', icon: '📈' },
              { id: 'analysis', label: 'Deep Analysis', icon: '🔍' },
              { id: 'commentary', label: 'Commentary', icon: '🎙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compact Tab Content */}
        <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-3">
          {activeTab === 'players' && (
            <PlayersStatsGrid match={matchData} viewModel={viewModel} />
          )}

          {activeTab === 'overview' && (
            <OverviewTabContent 
              matchData={matchData}
              matchSummary={matchSummary}
              topBatsmen={topBatsmen}
              topBowlers={topBowlers}
              generateManhattanData={generateManhattanData}
            />
          )}

          {activeTab === 'batting' && (
            <BattingTabContent topBatsmen={topBatsmen} />
          )}

          {activeTab === 'bowling' && (
            <BowlingTabContent topBowlers={topBowlers} />
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              {/* Cricket Insights */}
              <CricketInsights match={matchData} viewModel={viewModel} />
              
              {/* PowerPlay Analysis */}
              <PowerPlayAnalysis match={matchData} />
              
              {/* Partnership Breakdown */}
              <PartnershipBreakdown match={matchData} />
              
              {/* Bowling Spell Analysis */}
              <BowlingSpellAnalysis match={matchData} />
              
              {/* Match Momentum */}
              <MatchMomentum match={matchData} />
            </div>
          )}

          {activeTab === 'overs' && (
            <>
              {/* Compact Innings Selector */}
              <div className="mb-3">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5">
                  <span>📈</span>
                  Select Innings
                </h3>
                <div className="flex gap-1.5">
                  {(matchData.innings || []).map((innings, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedInnings(index)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedInnings === index
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                      }`}
                    >
                      {innings.team}
                    </button>
                  ))}
                </div>
              </div>

              {/* Over by Over Cards */}
              {matchData.innings?.[selectedInnings] && (
                <div>
                  <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-1.5">
                    <span>🏏</span>
                    {matchData.innings[selectedInnings].team} - Over by Over
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matchData.innings[selectedInnings].overs.map((over, index) => (
                      <OverByOverCard 
                        key={index} 
                        over={over} 
                        overNumber={index + 1} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'commentary' && (
            <>
              {/* Compact Innings Selector for Commentary */}
              <div className="mb-3">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5">
                  <span>🎙️</span>
                  Select Innings for Commentary
                </h3>
                <div className="flex gap-1.5">
                  {(matchData.innings || []).map((innings, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedInnings(index)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedInnings === index
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                      }`}
                    >
                      {innings.team}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Commentary */}
              {matchData.innings?.[selectedInnings] && (
                <LiveCommentary 
                  innings={matchData.innings[selectedInnings]}
                  title={`${matchData.innings[selectedInnings].team} Live Commentary`}
                  maxItems={15}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 