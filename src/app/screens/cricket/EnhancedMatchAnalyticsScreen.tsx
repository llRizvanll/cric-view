'use client';

import React, { useEffect, useState } from 'react';
import { CricketMatch, MatchSummary, PlayerStats, BowlingStats } from '../../models/CricketMatchModel';
import { CricketAnalyticsViewModel } from '../../viewmodels/CricketAnalyticsViewModel';

// Import new components
import { MatchHeader, ScoreCard, PlayerCard, LiveCommentary, StatsComparison, ManhattanChart, OverByOverCard, BarChart, LineChart, PieChart } from '../../components/cricket';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'batting' | 'bowling' | 'overs' | 'commentary'>('overview');
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading enhanced analytics...</div>
          <div className="text-sm text-gray-500 mt-2">Match ID: {matchId}</div>
        </div>
      </div>
    );
  }

  if (error || !matchData || !viewModel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">🏏</div>
          <div className="text-xl text-red-600 mb-4">{error || 'No match data available'}</div>
          <div className="text-sm text-gray-600 mb-4">Match ID: {matchId}</div>
          <button 
            onClick={() => window.history.back()} 
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const matchSummary = viewModel.getMatchSummary();
  const topBatsmen = viewModel.getTopBatsmen(6);
  const topBowlers = viewModel.getTopBowlers(6);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'batting', label: 'Batting', icon: '🏏' },
    { id: 'bowling', label: 'Bowling', icon: '⚾' },
    { id: 'overs', label: 'Over by Over', icon: '📈' },
    { id: 'commentary', label: 'Commentary', icon: '🎙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Matches</span>
          </button>
          
          <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded">
            Match ID: {matchId}
          </div>
        </div>

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
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-0 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Manhattan Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {matchData.innings?.map((innings, index) => (
                  <ManhattanChart
                    key={index}
                    data={generateManhattanData(matchData, index)}
                    title={`${innings.team} - Runs Per Over`}
                    height={300}
                  />
                ))}
              </div>

              {/* Quick Performance Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.max(...matchSummary.teamStats.map(t => t.totalRuns))}
                  </div>
                  <div className="text-sm text-gray-600">Highest Score</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {matchSummary.teamStats.reduce((sum, t) => sum + t.boundaries, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Boundaries</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {matchSummary.teamStats.reduce((sum, t) => sum + t.sixes, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Sixes</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {matchSummary.teamStats.reduce((sum, t) => sum + t.totalWickets, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Wickets</div>
                </div>
              </div>

              {/* Performance Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">🏆 Top Performers</h3>
                  <div className="space-y-3">
                    {topBatsmen.slice(0, 3).map((player, index) => (
                      <div key={player.name} className="flex justify-between items-center">
                        <span className="font-medium">{player.name}</span>
                        <span className="text-blue-600 font-bold">{player.runs} runs</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">🎯 Best Bowlers</h3>
                  <div className="space-y-3">
                    {topBowlers.slice(0, 3).map((player, index) => (
                      <div key={player.name} className="flex justify-between items-center">
                        <span className="font-medium">{player.name}</span>
                        <span className="text-red-600 font-bold">{player.wickets} wickets</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'batting' && (
            <>
              {/* Top Batsmen Grid */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Top Batting Performances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topBatsmen.map((player, index) => (
                    <PlayerCard 
                      key={player.name} 
                      player={player} 
                      type="batting" 
                      rank={index + 1} 
                    />
                  ))}
                </div>
              </div>

              {/* Batting Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart
                  data={topBatsmen.slice(0, 8).map(player => ({
                    name: player.name.split(' ').pop() || player.name,
                    runs: player.runs,
                    strikeRate: player.strikeRate
                  }))}
                  xAxisKey="name"
                  yAxisKey="runs"
                  title="Top Run Scorers"
                  color="#3b82f6"
                />
                
                <BarChart
                  data={topBatsmen.slice(0, 8).map(player => ({
                    name: player.name.split(' ').pop() || player.name,
                    strikeRate: player.strikeRate
                  }))}
                  xAxisKey="name"
                  yAxisKey="strikeRate"
                  title="Strike Rates"
                  color="#10b981"
                />
              </div>
            </>
          )}

          {activeTab === 'bowling' && (
            <>
              {/* Top Bowlers Grid */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Bowling Figures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topBowlers.map((player, index) => (
                    <PlayerCard 
                      key={player.name} 
                      player={player} 
                      type="bowling" 
                      rank={index + 1} 
                    />
                  ))}
                </div>
              </div>

              {/* Bowling Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart
                  data={topBowlers.slice(0, 8).map(player => ({
                    name: player.name.split(' ').pop() || player.name,
                    wickets: player.wickets
                  }))}
                  xAxisKey="name"
                  yAxisKey="wickets"
                  title="Wicket Takers"
                  color="#ef4444"
                />
                
                <BarChart
                  data={topBowlers.slice(0, 8).map(player => ({
                    name: player.name.split(' ').pop() || player.name,
                    economy: player.economy
                  }))}
                  xAxisKey="name"
                  yAxisKey="economy"
                  title="Economy Rates"
                  color="#f59e0b"
                />
              </div>
            </>
          )}

          {activeTab === 'overs' && (
            <>
              {/* Innings Selector */}
              {matchData.innings && matchData.innings.length > 1 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold mb-3">Select Innings</h3>
                  <div className="flex space-x-2">
                    {matchData.innings.map((innings, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedInnings(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedInnings === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {innings.team} ({index === 0 ? '1st' : '2nd'} Innings)
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
              {matchData.innings && matchData.innings.length > 1 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold mb-3">Select Innings for Commentary</h3>
                  <div className="flex space-x-2">
                    {matchData.innings.map((innings, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedInnings(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedInnings === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {innings.team} Commentary
                      </button>
                    ))}
                  </div>
                </div>
              )}

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