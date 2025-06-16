'use client';

import React, { useEffect, useState } from 'react';
import { LineChart } from '../../components/cricket/LineChart';
import { BarChart } from '../../components/cricket/BarChart';
import { PieChart } from '../../components/cricket/PieChart';
import { CricketAnalyticsViewModel } from '../../viewmodels/CricketAnalyticsViewModel';
import { CricketMatch, MatchSummary, PlayerStats, BowlingStats } from '../../models/CricketMatchModel';

interface AnalyticsScreenProps {
  matchId?: string;
}

export const CricketAnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ matchId = '1448347' }) => {
  const [matchData, setMatchData] = useState<CricketMatch | null>(null);
  const [viewModel, setViewModel] = useState<CricketAnalyticsViewModel | null>(null);
  const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
  const [topBatsmen, setTopBatsmen] = useState<PlayerStats[]>([]);
  const [topBowlers, setTopBowlers] = useState<BowlingStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching match data for ID:', matchId);
        const response = await fetch(`/api/matches/${matchId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch match data`);
        }
        
        const data: CricketMatch = await response.json();
        console.log('Match data received:', data);
        
        setMatchData(data);
        
        const analytics = new CricketAnalyticsViewModel(data);
        setViewModel(analytics);
        setMatchSummary(analytics.getMatchSummary());
        setTopBatsmen(analytics.getTopBatsmen(5));
        setTopBowlers(analytics.getTopBowlers(5));
        
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading match analytics for ID: {matchId}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <div className="text-sm text-gray-600">Match ID: {matchId}</div>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!matchData || !viewModel || !matchSummary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">No match data available</div>
      </div>
    );
  }

  const progression = viewModel.getOverByOverProgression();
  const partnerships = viewModel.getPartnershipAnalysis();
  const boundaryAnalysis = viewModel.getBoundaryAnalysis();
  const wicketAnalysis = viewModel.getWicketAnalysis();

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Navigation */}
      <div className="mb-4">
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          ← Back to Matches
        </button>
      </div>

      {/* Match Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4">
          {matchSummary.teams.join(' vs ')}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p><strong>Venue:</strong> {matchSummary.venue}</p>
            <p><strong>Date:</strong> {new Date(matchSummary.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p><strong>Match Type:</strong> {matchSummary.matchType}</p>
            <p><strong>Result:</strong> {matchSummary.result}</p>
          </div>
          <div>
            {matchSummary.playerOfMatch && (
              <p><strong>Player of the Match:</strong> {matchSummary.playerOfMatch}</p>
            )}
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matchSummary.teamStats.map((teamStat, index) => (
          <div key={teamStat.team} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{teamStat.team}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Total Runs:</strong> {teamStat.totalRuns}</p>
                <p><strong>Wickets:</strong> {teamStat.totalWickets}</p>
                <p><strong>Overs:</strong> {teamStat.totalOvers}</p>
              </div>
              <div>
                <p><strong>Run Rate:</strong> {teamStat.runRate}</p>
                <p><strong>Boundaries:</strong> {teamStat.boundaries}</p>
                <p><strong>Sixes:</strong> {teamStat.sixes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Run Progression Chart */}
        {progression.length > 0 && (
          <LineChart
            data={progression[0].progression}
            xAxisKey="over"
            yAxisKey="totalRuns"
            title={`${progression[0].team} - Run Progression`}
            color="#8884d8"
          />
        )}

        {/* Boundary Analysis */}
        <PieChart
          data={boundaryAnalysis.byTeam.map(team => ({
            name: `${team.team} (4s: ${team.fours}, 6s: ${team.sixes})`,
            value: team.total
          }))}
          title="Boundaries by Team"
        />

        {/* Top Batsmen */}
        <BarChart
          data={topBatsmen.map(player => ({
            name: player.name,
            runs: player.runs,
            strikeRate: player.strikeRate
          }))}
          xAxisKey="name"
          yAxisKey="runs"
          title="Top Run Scorers"
          color="#82ca9d"
        />

        {/* Wicket Types */}
        {wicketAnalysis.wicketTypes.length > 0 && (
          <PieChart
            data={wicketAnalysis.wicketTypes}
            title="Wicket Types"
            colors={['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#8884D8']}
          />
        )}
      </div>

      {/* Top Performers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Batsmen Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Batsmen</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Player</th>
                  <th className="text-right p-2">Runs</th>
                  <th className="text-right p-2">Balls</th>
                  <th className="text-right p-2">S/R</th>
                  <th className="text-right p-2">4s/6s</th>
                </tr>
              </thead>
              <tbody>
                {topBatsmen.map((player, index) => (
                  <tr key={player.name} className="border-b">
                    <td className="p-2 font-medium">{player.name}</td>
                    <td className="text-right p-2">{player.runs}</td>
                    <td className="text-right p-2">{player.balls}</td>
                    <td className="text-right p-2">{player.strikeRate.toFixed(1)}</td>
                    <td className="text-right p-2">{player.boundaries}/{player.sixes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Bowlers Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Bowlers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Player</th>
                  <th className="text-right p-2">Wickets</th>
                  <th className="text-right p-2">Runs</th>
                  <th className="text-right p-2">Overs</th>
                  <th className="text-right p-2">Economy</th>
                </tr>
              </thead>
              <tbody>
                {topBowlers.map((player, index) => (
                  <tr key={player.name} className="border-b">
                    <td className="p-2 font-medium">{player.name}</td>
                    <td className="text-right p-2">{player.wickets}</td>
                    <td className="text-right p-2">{player.runs}</td>
                    <td className="text-right p-2">{player.overs}</td>
                    <td className="text-right p-2">{player.economy.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Partnerships */}
      {partnerships.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Partnerships</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Batsmen</th>
                  <th className="text-right p-2">Runs</th>
                  <th className="text-right p-2">Balls</th>
                  <th className="text-right p-2">Run Rate</th>
                  <th className="text-left p-2">Team</th>
                </tr>
              </thead>
              <tbody>
                {partnerships.slice(0, 10).map((partnership, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">
                      {partnership.batters.join(' & ')}
                    </td>
                    <td className="text-right p-2">{partnership.runs}</td>
                    <td className="text-right p-2">{partnership.balls}</td>
                    <td className="text-right p-2">
                      {((partnership.runs / partnership.balls) * 6).toFixed(2)}
                    </td>
                    <td className="p-2">{partnership.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 