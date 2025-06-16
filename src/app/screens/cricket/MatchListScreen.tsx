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
  const [allMatches, setAllMatches] = useState<CricketMatch[]>([]);
  const [availableMatchTypes, setAvailableMatchTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const loadMatches = async (page: number = 1, matchTypeFilter: string = 'all', append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
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
      
      if (append) {
        // Append new matches to existing ones
        setAllMatches(prev => [...prev, ...data.matches]);
      } else {
        // Replace all matches (new filter)
        setAllMatches(data.matches);
      }
      
      setAvailableMatchTypes(data.availableMatchTypes);
      setCurrentPage(page);
      setFilter(matchTypeFilter);
      setHasMoreData(data.pagination.hasNext);
      setTotalCount(data.pagination.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matches';
      setError(errorMessage);
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadMatches(1, 'all', false);
  }, []);

  const handleLoadMore = () => {
    if (hasMoreData && !loadingMore) {
      loadMatches(currentPage + 1, filter, true);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    if (newFilter !== filter) {
      // Reset all matches and start from page 1
      setAllMatches([]);
      setCurrentPage(1);
      setHasMoreData(true);
      loadMatches(1, newFilter, false);
    }
  };

  console.log('Debug info:', {
    totalMatches: allMatches.length,
    filter,
    availableMatchTypes,
    currentPage,
    hasMoreData,
    totalCount,
    loadingMore
  });

  if (loading && allMatches.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Cricket Matches</h1>
          <div className="text-sm text-gray-600">Loading...</div>
        </div>

        {/* Loading skeleton for filter buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 h-10 w-20 rounded-lg"></div>
          ))}
        </div>

        {/* Loading skeleton for match cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="p-4 border-b border-gray-100">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-b-lg">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && allMatches.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-xl text-red-600 mb-4">Failed to Load Matches</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <div className="space-y-2">
            <button 
              onClick={() => loadMatches(1, filter, false)} 
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

  if (allMatches.length === 0 && totalCount === 0) {
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
          Showing {allMatches.length} of {totalCount} matches
          {filter !== 'all' && ` (${filter})`}
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
        {allMatches.map((match, index) => {
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

      {/* Load More Button */}
      {hasMoreData && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              loadingMore
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading more matches...
              </div>
            ) : (
              `Load More Matches (${totalCount - allMatches.length} remaining)`
            )}
          </button>
        </div>
      )}

      {/* End of results message */}
      {!hasMoreData && allMatches.length > 0 && (
        <div className="text-center mt-8 py-4">
          <div className="text-gray-500">
            🏏 You&apos;ve reached the end! All {totalCount} matches loaded.
          </div>
          {filter !== 'all' && (
            <button 
              onClick={() => handleFilterChange('all')}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              View all match types
            </button>
          )}
        </div>
      )}

      {/* Error message for load more */}
      {error && allMatches.length > 0 && (
        <div className="text-center mt-8 py-4">
          <div className="text-red-600 mb-2">Failed to load more matches</div>
          <button 
            onClick={handleLoadMore}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};