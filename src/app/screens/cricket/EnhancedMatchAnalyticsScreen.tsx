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

  // Apple-style navigation items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '●', onClick: () => setActiveTab('overview') },
    { id: 'scorecard', label: 'Scorecard', icon: '●', onClick: () => setActiveTab('scorecard') },
    { id: 'players', label: 'Players', icon: '●', onClick: () => setActiveTab('players') },
    { id: 'batting', label: 'Batting', icon: '●', onClick: () => setActiveTab('batting') },
    { id: 'bowling', label: 'Bowling', icon: '●', onClick: () => setActiveTab('bowling') },
    { id: 'analysis', label: 'Analytics', icon: '●', onClick: () => setActiveTab('analysis') },
    { id: 'overs', label: 'Over by Over', icon: '●', onClick: () => setActiveTab('overs') },
    { id: 'commentary', label: 'Commentary', icon: '●', onClick: () => setActiveTab('commentary') }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Apple-style Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => window.history.back()} 
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </button>
              
              {!isMobile && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Live</span>
                  </div>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500 font-mono">{matchId}</span>
                </div>
              )}
            </div>
            
            {/* Center */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                Cricket Analytics
              </h1>
            </div>
            
            {/* Right side */}
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Apple-style Match Header */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center">
            <div className="space-y-6">
              {/* Match Title */}
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                  {matchData.info.teams[0]} vs {matchData.info.teams[1]}
                </h2>
                <div className="flex items-center justify-center space-x-4 text-gray-600">
                  <span className="text-lg">{matchData.info.venue}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-lg">{matchData.info.match_type}</span>
                </div>
              </div>

              {/* Match Status */}
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-900">Live Match</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apple-style Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 border-b-2 ${
                    activeTab === item.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            
            {/* Detailed Scorecard Tab */}
            {activeTab === 'scorecard' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Match Scorecard</h2>
                  <p className="text-gray-600">Detailed batting and bowling statistics</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <DetailedScorecard 
                    match={matchData} 
                    selectedInnings={selectedInnings}
                    onInningsChange={setSelectedInnings}
                  />
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Match Overview</h2>
                  <p className="text-gray-600">Key statistics and team comparison</p>
                </div>
                
                <div className="space-y-6">
                  {matchSummary.teamStats.length >= 2 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                      <StatsComparison teamStats={matchSummary.teamStats} />
                    </div>
                  )}
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <OverviewTabContent 
                      matchData={matchData}
                      matchSummary={matchSummary}
                      topBatsmen={topBatsmen}
                      topBowlers={topBowlers}
                      generateManhattanData={generateManhattanData}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Players Tab */}
            {activeTab === 'players' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Player Statistics</h2>
                  <p className="text-gray-600">Individual performance analysis</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <PlayersStatsGrid match={matchData} viewModel={viewModel} />
                </div>
              </div>
            )}

            {/* Batting Tab */}
            {activeTab === 'batting' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Batting Analysis</h2>
                  <p className="text-gray-600">Top batting performances and charts</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <BattingTabContent topBatsmen={topBatsmen} />
                </div>
              </div>
            )}

            {/* Bowling Tab */}
            {activeTab === 'bowling' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Bowling Analysis</h2>
                  <p className="text-gray-600">Bowling figures and performance metrics</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <BowlingTabContent topBowlers={topBowlers} />
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h2>
                  <p className="text-gray-600">Deep insights and match momentum analysis</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <MicroMatchMomentum match={matchData} />
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <BallByBallMomentumBreakdown match={matchData} />
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <PowerPlayAnalysis match={matchData} />
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <PartnershipBreakdown match={matchData} />
                  </div>
                  
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <BowlingSpellAnalysis match={matchData} />
                  </div>
                </div>
              </div>
            )}

            {/* Over by Over Tab */}
            {activeTab === 'overs' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Over by Over</h2>
                  <p className="text-gray-600">Detailed breakdown of each over</p>
                </div>
                
                {/* Innings Selector */}
                <div className="flex justify-center">
                  <div className="inline-flex bg-gray-100 rounded-lg p-1">
                    {(matchData.innings || []).map((innings, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedInnings(index)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          selectedInnings === index
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {innings.team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Over Cards */}
                {matchData.innings?.[selectedInnings] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {matchData.innings[selectedInnings].overs.map((over, index) => (
                      <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
                        <OverByOverCard 
                          over={over} 
                          overNumber={index + 1} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Commentary Tab */}
            {activeTab === 'commentary' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Commentary</h2>
                  <p className="text-gray-600">Ball-by-ball match commentary</p>
                </div>
                
                {/* Innings Selector */}
                <div className="flex justify-center">
                  <div className="inline-flex bg-gray-100 rounded-lg p-1">
                    {(matchData.innings || []).map((innings, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedInnings(index)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          selectedInnings === index
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {innings.team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commentary */}
                {matchData.innings?.[selectedInnings] && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <LiveCommentary 
                      innings={matchData.innings[selectedInnings]}
                      title={`${matchData.innings[selectedInnings].team} Commentary`}
                      maxItems={15}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Apple-style Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">Cricket Analytics • Powered by CricInfo</p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 