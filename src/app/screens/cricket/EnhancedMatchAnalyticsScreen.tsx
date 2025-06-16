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
  BowlingTabContent
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 space-y-6">
        {/* Navigation */}
        <NavigationHeader matchId={matchId} />

        {/* Enhanced Match Header */}
        <MatchHeader match={matchData} />

        {/* Live Score Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matchData.innings?.map((innings, index) => (
            <ScoreCard key={index} match={matchData} selectedInnings={index} />
          ))}
        </div>

        {/* Team Comparison */}
        {matchSummary.teamStats.length >= 2 && (
          <StatsComparison teamStats={matchSummary.teamStats} />
        )}

        {/* Navigation Tabs */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="space-y-6">
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

          {activeTab === 'overs' && (
            <>
              {/* Innings Selector */}
              <InningsSelector 
                innings={matchData.innings || []}
                selectedInnings={selectedInnings}
                onInningsChange={setSelectedInnings}
                title="Select Innings"
              />

              {/* Over by Over Cards */}
              {matchData.innings?.[selectedInnings] && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {matchData.innings[selectedInnings].team} - Over by Over
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              {/* Innings Selector for Commentary */}
              <InningsSelector 
                innings={matchData.innings || []}
                selectedInnings={selectedInnings}
                onInningsChange={setSelectedInnings}
                title="Select Innings for Commentary"
              />

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