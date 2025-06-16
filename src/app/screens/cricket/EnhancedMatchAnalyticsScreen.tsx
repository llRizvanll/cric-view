'use client';

import React, { useEffect, useState } from 'react';
import { CricketMatch, MatchSummary, PlayerStats, BowlingStats } from '../../models/CricketMatchModel';
import { CricketAnalyticsViewModel } from '../../viewmodels/CricketAnalyticsViewModel';
import { useResponsive, getResponsiveText, getResponsivePadding, getResponsiveGap } from '../../utils/responsive';

// Import components
import { 
  // Core components
  MatchHeader, 
  ScoreCard, 
  DetailedScorecard,
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
  PowerPlayAnalysis,
  PartnershipBreakdown,
  BowlingSpellAnalysis,
  MicroMatchMomentum,
  BallByBallMomentumBreakdown,
  // Responsive components
  ResponsiveNavigation
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Get responsive state
  const { isMobile, isTablet, isDesktop } = useResponsive();

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

  // Navigation items for ResponsiveNavigation
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '📊', onClick: () => setActiveTab('overview') },
    { id: 'scorecard', label: 'Scorecard', icon: '🏏', onClick: () => setActiveTab('scorecard') },
    { id: 'players', label: 'Players', icon: '👥', onClick: () => setActiveTab('players') },
    { id: 'batting', label: 'Batting', icon: '🏏', onClick: () => setActiveTab('batting') },
    { id: 'bowling', label: 'Bowling', icon: '⚾', onClick: () => setActiveTab('bowling') },
    { id: 'analysis', label: 'Analytics', icon: '🔍', onClick: () => setActiveTab('analysis') },
    { id: 'overs', label: 'Over by Over', icon: '📈', onClick: () => setActiveTab('overs') },
    { id: 'commentary', label: 'Commentary', icon: '🎙️', onClick: () => setActiveTab('commentary') }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-2/3 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Responsive Layout Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <div className="flex-shrink-0 relative overflow-hidden border-b border-slate-700/50 bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5"></div>
          <div className={`relative flex items-center justify-between ${getResponsivePadding('p-3', 'md:p-4', 'lg:p-4')}`}>
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => window.history.back()} 
                className="group flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-all duration-300 border border-slate-600/30 hover:border-slate-500/50"
              >
                <span className="text-sm group-hover:scale-110 transition-transform">←</span>
                <span className={`${getResponsiveText('text-xs', 'md:text-sm')} font-medium hidden sm:inline`}>Back</span>
              </button>
              
              <div className="hidden lg:flex items-center gap-3">
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
              <span className={`${getResponsiveText('text-sm', 'md:text-base')} font-semibold hidden xs:block`}>
                CricInfo Analytics
              </span>
            </div>
          </div>
        </div>

        {/* Match Header */}
        <div className="bg-gradient-to-r from-slate-800/95 to-slate-700/95 border-slate-700/50 border-b p-4 md:p-6">
          <MatchHeader match={matchData} showDetails={!isMobile} />
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0 border-b border-slate-700/50 bg-slate-800/95">
          <ResponsiveNavigation items={navigationItems} activeItem={activeTab} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
            <div className={`space-y-4 ${getResponsiveGap('gap-4', 'md:gap-6', 'lg:gap-8')}`}>
              
              {/* Detailed Scorecard Tab */}
              {activeTab === 'scorecard' && (
                <DetailedScorecard 
                  match={matchData} 
                  selectedInnings={selectedInnings}
                  onInningsChange={setSelectedInnings}
                />
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
  );
}; 