'use client';

import React, { useEffect, useState } from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';
import Link from 'next/link';

export const MatchListScreen: React.FC = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }
        const data = await response.json();
        setMatches(data);
      } catch (err) {
        setError('Failed to load matches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.info.match_type.toLowerCase() === filter.toLowerCase();
  });

  const matchTypes = [...new Set(matches.map(match => match.info.match_type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cricket Matches</h1>
        <div className="text-sm text-gray-600">
          {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''} found
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({matches.length})
        </button>
        {matchTypes.map(type => {
          const count = matches.filter(m => m.info.match_type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type} ({count})
            </button>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map((match, index) => {
          const matchDate = new Date(match.info.dates[0]);
          const isRecent = (Date.now() - matchDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
          
          return (
            <Link
              key={match.matchId || `match-${index}`}
              href={`/analytics/${match.matchId}`}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 group-hover:scale-105 relative">
                {/* Match Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {match.info.teams.join(' vs ')}
                    </h2>
                    {isRecent && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Recent
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {match.info.match_type}
                    </span>
                    <span>{matchDate.toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Match Details */}
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue:</span>
                      <span className="text-gray-900 font-medium text-right">
                        {match.info.venue}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event:</span>
                      <span className="text-gray-900 font-medium text-right">
                        {match.info.event.name}
                      </span>
                    </div>

                    {match.info.event.stage && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stage:</span>
                        <span className="text-gray-900 font-medium">
                          {match.info.event.stage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Result */}
                <div className="p-4 bg-gray-50 rounded-b-lg">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 mb-1">
                      🏆 {match.info.outcome.winner} won{' '}
                      {match.info.outcome.by?.runs && `by ${match.info.outcome.by.runs} runs`}
                      {match.info.outcome.by?.wickets && `by ${match.info.outcome.by.wickets} wickets`}
                    </p>
                    
                    {match.info.player_of_match?.[0] && (
                      <p className="text-gray-600">
                        🌟 Player of the Match: <span className="font-medium">{match.info.player_of_match[0]}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    View Analytics →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No matches found for the selected filter.</div>
        </div>
      )}
    </div>
  );
}; 