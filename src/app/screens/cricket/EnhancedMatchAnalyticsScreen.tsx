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
  MatchMomentum,
  MicroMatchMomentum,
  BallByBallMomentumBreakdown
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-2/3 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Email-style Layout Container */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Header Bar */}
        <div className="flex-shrink-0 relative overflow-hidden border-b border-slate-700/50 bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5"></div>
          <div className="relative flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()} 
                className="group flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-all duration-300 border border-slate-600/30 hover:border-slate-500/50"
              >
                <span className="text-sm group-hover:scale-110 transition-transform">←</span>
                <span className="text-sm font-medium">Back</span>
              </button>
              
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-xs font-medium">Live Analysis</span>
                </div>
                <div className="text-slate-400 text-xs">
                  Match ID: <span className="font-mono text-slate-300">{matchId}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-xl">🏏</span>
              <span className="hidden sm:block text-sm font-semibold">CricInfo Analytics</span>
            </div>
          </div>
        </div>

        {/* Email-style Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Navigation Menu */}
          <div className="w-80 bg-gradient-to-b from-slate-800/95 to-slate-900/95 border-r border-slate-700/50 backdrop-blur-xl flex flex-col">
            {/* Match Header in Sidebar */}
            <div className="flex-shrink-0 p-4 border-b border-slate-700/50">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm">🏏</span>
                  </div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                    {matchData.info.teams.join(' vs ')}
                  </h1>
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-sm">🏆</span>
                  </div>
                </div>
                
                {/* Match Result */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-lg px-3 py-2 mb-3">
                  <div className="text-white font-semibold text-xs">
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

                {/* Quick Info Pills */}
                <div className="flex flex-wrap justify-center gap-1">
                  <span className="bg-slate-700/50 px-2 py-1 rounded text-slate-300 text-xs">
                    {matchData.info.dates?.[0] ? new Date(matchData.info.dates[0]).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    }) : 'TBD'}
                  </span>
                  <span className="bg-slate-700/50 px-2 py-1 rounded text-slate-300 text-xs">
                    {matchData.info.match_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {[
                  { id: 'overview', label: 'Match Overview', icon: '📊', description: 'Summary & highlights' },
                  { id: 'scorecard', label: 'Live Scorecard', icon: '🏏', description: 'Current scores & status' },
                  { id: 'players', label: 'Players Performance', icon: '👥', description: 'Individual statistics' },
                  { id: 'batting', label: 'Batting Analysis', icon: '🏏', description: 'Top batting performances' },
                  { id: 'bowling', label: 'Bowling Analysis', icon: '⚾', description: 'Bowling figures & economy' },
                  { id: 'analysis', label: 'Deep Analytics', icon: '🔍', description: 'AI-powered insights' },
                  { id: 'overs', label: 'Over by Over', icon: '📈', description: 'Ball-by-ball breakdown' },
                  { id: 'commentary', label: 'Live Commentary', icon: '🎙️', description: 'Match commentary' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 border ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border-blue-500/30 text-white shadow-lg'
                        : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40 hover:border-slate-500/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-lg ${activeTab === item.id ? 'scale-110' : ''} transition-transform`}>
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.label}</div>
                        <div className={`text-xs mt-0.5 ${activeTab === item.id ? 'text-slate-200' : 'text-slate-400'}`}>
                          {item.description}
                        </div>
                      </div>
                      {activeTab === item.id && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Content Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-slate-800/95 to-slate-700/95 border-b border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white capitalize">
                    {activeTab === 'scorecard' ? 'Live Scorecard' : 
                     activeTab === 'overview' ? 'Match Overview' :
                     activeTab === 'players' ? 'Players Performance' :
                     activeTab === 'analysis' ? 'Deep Analytics' :
                     activeTab === 'overs' ? 'Over by Over' :
                     activeTab === 'commentary' ? 'Live Commentary' :
                     activeTab === 'batting' ? 'Batting Analysis' :
                     activeTab === 'bowling' ? 'Bowling Analysis' : 
                     'Match Details'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {activeTab === 'scorecard' ? 'Current match scores and status' :
                     activeTab === 'overview' ? 'Match summary and key highlights' :
                     activeTab === 'players' ? 'Individual player statistics and performance' :
                     activeTab === 'analysis' ? 'AI-powered insights and advanced analytics' :
                     activeTab === 'overs' ? 'Ball-by-ball breakdown of each over' :
                     activeTab === 'commentary' ? 'Live match commentary and updates' :
                     activeTab === 'batting' ? 'Top batting performances and statistics' :
                     activeTab === 'bowling' ? 'Bowling figures and economy rates' : 
                     'Detailed analysis and statistics'}
                  </p>
                </div>
                
                {/* Quick Stats in Header */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{matchSummary.teamStats[0]?.totalRuns || 0}</div>
                    <div className="text-xs text-slate-400">{matchData.info.teams[0]}</div>
                  </div>
                  <div className="text-slate-400">vs</div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{matchSummary.teamStats[1]?.totalRuns || 0}</div>
                    <div className="text-xs text-slate-400">{matchData.info.teams[1]}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <div className="p-6">
                
                {/* Live Scorecard Tab */}
                {activeTab === 'scorecard' && (
                  <div className="space-y-6">
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
                        <div key={index} className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 via-slate-700/60 to-slate-800/60 backdrop-blur-xl group hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02]">
                          {/* Enhanced Team Header */}
                          <div className={`relative p-5 bg-gradient-to-r ${index === 0 ? 'from-blue-600/30 to-blue-500/20' : 'from-emerald-600/30 to-emerald-500/20'}`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
                                  <span className="text-xl">🏏</span>
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-white">{innings.team}</h3>
                                  <span className="text-slate-300 text-sm font-medium">Innings {index + 1}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-white">
                                  {totalRuns}/{totalWickets}
                                </div>
                                <div className="text-slate-300 text-sm font-medium">
                                  ({overs}.{balls} overs)
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Stats */}
                          <div className="p-5">
                            <div className="grid grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                  <span className="text-white font-bold text-sm">{runRate.toFixed(1)}</span>
                                </div>
                                <div className="text-slate-400 text-xs font-medium">Run Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                  <span className="text-white font-bold text-sm">{boundaries}</span>
                                </div>
                                <div className="text-slate-400 text-xs font-medium">Fours</div>
                              </div>
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                  <span className="text-white font-bold text-sm">{sixes}</span>
                                </div>
                                <div className="text-slate-400 text-xs font-medium">Sixes</div>
                              </div>
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                  <span className="text-white font-bold text-sm">{totalWickets}</span>
                                </div>
                                <div className="text-slate-400 text-xs font-medium">Wickets</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Team Comparison */}
                {activeTab === 'overview' && (
                  <>
                    {matchSummary.teamStats.length >= 2 && (
                      <StatsComparison teamStats={matchSummary.teamStats} />
                    )}
                    <OverviewTabContent 
                      matchData={matchData}
                      matchSummary={matchSummary}
                      topBatsmen={topBatsmen}
                      topBowlers={topBowlers}
                      generateManhattanData={generateManhattanData}
                    />
                  </>
                )}

                {activeTab === 'players' && (
                  <PlayersStatsGrid match={matchData} viewModel={viewModel} />
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
                    
                    {/* Micro Match Momentum Model */}
                    <MicroMatchMomentum match={matchData} />
                    
                    {/* Ball-by-Ball Momentum Breakdown */}
                    <BallByBallMomentumBreakdown match={matchData} />
                    
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
        </div>
      </div>
    </div>
  );
}; 