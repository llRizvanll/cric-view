'use client';

import React, { useEffect, useState } from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';
import Link from 'next/link';

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface MatchesResponse {
  matches: CricketMatch[];
  pagination: PaginationInfo;
  availableMatchTypes: string[];
  currentFilter: string;
}

export const MatchListScreen: React.FC = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [availableMatchTypes, setAvailableMatchTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const loadMatches = async (page: number = 1, matchTypeFilter: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (matchTypeFilter !== 'all') {
        params.append('match_type', matchTypeFilter);
      }
      
      const url = `/api/matches?${params.toString()}`;
      console.log(`Fetching matches from ${url}`);
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch matches`);
      }
      
      const data: MatchesResponse = await response.json();
      console.log('Matches received:', data.matches.length, 'matches');
      console.log('Pagination info:', data.pagination);
      console.log('Available match types:', data.availableMatchTypes);
      
      setMatches(data.matches);
      setPagination(data.pagination);
      setAvailableMatchTypes(data.availableMatchTypes);
      setCurrentPage(page);
      setFilter(matchTypeFilter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matches';
      setError(errorMessage);
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches(1, 'all');
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage && pagination) {
      if (newPage >= 1 && newPage <= pagination.totalPages) {
        loadMatches(newPage, filter);
      }
    }
  };

  const handleFilterChange = (newFilter: string) => {
    if (newFilter !== filter) {
      // Reset to page 1 when changing filters
      loadMatches(1, newFilter);
    }
  };

  // Remove client-side filtering since we're doing it server-side now
  const filteredMatches = matches;

  console.log('Debug info:', {
    totalMatches: matches.length,
    filteredMatches: filteredMatches.length,
    filter,
    availableMatchTypes,
    currentPage,
    pagination
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl mb-4">Loading matches...</div>
          <div className="text-sm text-gray-600">
            Fetching data from API (Page {currentPage}, Filter: {filter})
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-xl text-red-600 mb-4">Failed to Load Matches</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <div className="space-y-2">
            <button 
              onClick={() => loadMatches(currentPage, filter)} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              Retry
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Check browser console for more details
          </div>
        </div>
      </div>
    );
  }

  if (matches.length === 0 && pagination?.total === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl mb-4">No Matches Found</div>
          <div className="text-sm text-gray-600">
            {filter === 'all' 
              ? 'No cricket match data available'
              : `No ${filter} matches found`
            }
          </div>
          {filter !== 'all' && (
            <button 
              onClick={() => handleFilterChange('all')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Show All Matches
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cricket Matches</h1>
        <div className="text-sm text-gray-600">
          {pagination && (
            <>
              Showing {matches.length} of {pagination.total} matches
              {filter !== 'all' && ` (${filter})`}
              <br />
              Page {pagination.page} of {pagination.totalPages}
            </>
          )}
        </div>
      </div>

      {/* Filter buttons */}
      {availableMatchTypes.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {availableMatchTypes.map(type => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}
      
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
                    {match.info.venue && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Venue:</span>
                        <span className="text-gray-900 font-medium text-right">
                          {match.info.venue}
                        </span>
                      </div>
                    )}
                    
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

                    {match.info.event.sub_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Series:</span>
                        <span className="text-gray-900 font-medium text-right">
                          {match.info.event.sub_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Result */}
                <div className="p-4 bg-gray-50 rounded-b-lg">
                  <div className="text-sm">
                    {match.info.outcome.winner ? (
                      <p className="font-semibold text-gray-900 mb-1">
                        🏆 {match.info.outcome.winner} won{' '}
                        {match.info.outcome.by?.runs && `by ${match.info.outcome.by.runs} runs`}
                        {match.info.outcome.by?.wickets && `by ${match.info.outcome.by.wickets} wickets`}
                        {match.info.outcome.by?.innings && match.info.outcome.by?.runs && ` and ${match.info.outcome.by.runs} runs`}
                      </p>
                    ) : match.info.outcome.result ? (
                      <p className="font-semibold text-gray-900 mb-1">
                        📊 {match.info.outcome.result}
                      </p>
                    ) : (
                      <p className="font-semibold text-gray-900 mb-1">
                        🏏 Match completed
                      </p>
                    )}
                    
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

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={!pagination.hasPrev}
            className={`px-3 py-2 text-sm rounded ${
              !pagination.hasPrev
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            First
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className={`px-3 py-2 text-sm rounded ${
              !pagination.hasPrev
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className={`px-3 py-2 text-sm rounded ${
              !pagination.hasNext
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Next
          </button>

          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={!pagination.hasNext}
            className={`px-3 py-2 text-sm rounded ${
              !pagination.hasNext
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last
          </button>
        </div>
      )}

      {filteredMatches.length === 0 && matches.length === 0 && pagination && pagination.total > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No matches found on this page.</div>
          <button 
            onClick={() => handlePageChange(1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to First Page
          </button>
        </div>
      )}
    </div>
  );
}; 