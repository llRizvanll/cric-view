'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  availableYears: string[];
  currentFilter: string;
  currentYear: string;
}

// Memoized match card component for better performance
const MatchCard = React.memo(({ match }: { match: CricketMatch }) => {
  const outcome = match.info.outcome;
  const winnerDisplay = outcome?.winner ? `Winner: ${outcome.winner}` : 
                       outcome?.result ? outcome.result : 'No result';
  
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Link 
      href={`/analytics/${match.matchId}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300"
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {match.info.match_type || 'Unknown'}
          </span>
          {match.info.dates?.[0] && (
            <span className="text-xs text-gray-500">
              {formatDate(match.info.dates[0])}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          {match.info.teams && (
            <span className="font-medium text-gray-700">
              {Array.isArray(match.info.teams) ? match.info.teams.join(' vs ') : 'Teams TBD'}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-2 text-sm">
          {match.info.venue && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📍</span>
              <span className="text-gray-700">
                {match.info.venue}{match.info.city && `, ${match.info.city}`}
              </span>
            </div>
          )}
          
          {match.info.event && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">🏆</span>
              <span className="text-gray-700">
                {typeof match.info.event === 'string' ? match.info.event : match.info.event?.name || 'Event'}
              </span>
            </div>
          )}
          
          {match.info.season && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📅</span>
              <span className="text-gray-700">{match.info.season}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-b-lg">
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-1">{winnerDisplay}</div>
          {match.info.player_of_match && (
            <div className="text-gray-600">
              Player of the Match: {Array.isArray(match.info.player_of_match) ? 
                match.info.player_of_match.join(', ') : match.info.player_of_match}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

MatchCard.displayName = 'MatchCard';

// Loading skeleton component
const LoadingSkeleton = React.memo(() => (
  <div className="bg-white rounded-lg shadow animate-pulse border border-gray-200">
    <div className="p-4 border-b border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
    <div className="p-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="p-4 bg-gray-50 rounded-b-lg">
      <div className="h-4 bg-gray-200 rounded mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export const MatchListScreen: React.FC = () => {
  const [allMatches, setAllMatches] = useState<CricketMatch[]>([]);
  const [availableMatchTypes, setAvailableMatchTypes] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const loadMatches = useCallback(async (
    page: number = 1, 
    matchTypeFilter: string = 'all', 
    year: string = 'all', 
    append: boolean = false
  ) => {
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
      
      if (year !== 'all') {
        params.append('year', year);
      }
      
      const url = `/api/matches?${params.toString()}`;
      console.log(`Fetching matches from ${url}`);
      
      const response = await fetch(url, {
        // Add cache headers for better performance
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch matches`);
      }
      
      const data: MatchesResponse = await response.json();
      console.log('Matches received:', data.matches.length, 'matches');
      
      if (append) {
        // Append new matches to existing ones
        setAllMatches(prev => [...prev, ...data.matches]);
      } else {
        // Replace all matches (new filter)
        setAllMatches(data.matches);
      }
      
      setAvailableMatchTypes(data.availableMatchTypes);
      setAvailableYears(data.availableYears);
      setCurrentPage(page);
      setFilter(matchTypeFilter);
      setYearFilter(year);
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
  }, []);

  useEffect(() => {
    loadMatches(1, 'all', 'all', false);
  }, [loadMatches]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreData && !loadingMore) {
      loadMatches(currentPage + 1, filter, yearFilter, true);
    }
  }, [hasMoreData, loadingMore, currentPage, filter, yearFilter, loadMatches]);

  const handleFilterChange = useCallback((newFilter: string) => {
    if (newFilter !== filter) {
      // Reset all matches and start from page 1
      setAllMatches([]);
      setCurrentPage(1);
      setHasMoreData(true);
      loadMatches(1, newFilter, yearFilter, false);
    }
  }, [filter, yearFilter, loadMatches]);

  const handleYearChange = useCallback((newYear: string) => {
    if (newYear !== yearFilter) {
      // Reset all matches and start from page 1
      setAllMatches([]);
      setCurrentPage(1);
      setHasMoreData(true);
      loadMatches(1, filter, newYear, false);
    }
  }, [filter, yearFilter, loadMatches]);

  // Memoized filter buttons to prevent unnecessary re-renders
  const filterButtons = useMemo(() => (
    <div className="flex gap-2 mb-6 flex-wrap">
      <button
        onClick={() => handleFilterChange('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filter === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        All ({totalCount})
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
  ), [filter, totalCount, availableMatchTypes, handleFilterChange]);

  const yearButtons = useMemo(() => (
    <div className="flex gap-2 mb-6 flex-wrap">
      <button
        onClick={() => handleYearChange('all')}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          yearFilter === 'all'
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        All Years
      </button>
      {availableYears.slice(0, 10).map(year => (
        <button
          key={year}
          onClick={() => handleYearChange(year)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            yearFilter === year
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {year}
        </button>
      ))}
      {availableYears.length > 10 && (
        <span className="px-3 py-1 text-sm text-gray-500">
          +{availableYears.length - 10} more
        </span>
      )}
    </div>
  ), [yearFilter, availableYears, handleYearChange]);

  // Memoized match grid to prevent unnecessary re-renders
  const matchGrid = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allMatches.map(match => (
        <MatchCard key={match.matchId} match={match} />
      ))}
      
      {/* Loading skeleton for "Load More" */}
      {loadingMore && Array.from({ length: 6 }, (_, i) => (
        <LoadingSkeleton key={`loading-${i}`} />
      ))}
    </div>
  ), [allMatches, loadingMore]);

  if (loading && allMatches.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Cricket Matches</h1>
          <div className="text-sm text-gray-600 animate-pulse">Loading optimized data...</div>
        </div>

        {/* Loading skeleton for filter buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-10 w-20 rounded-lg"></div>
          ))}
        </div>

        <div className="text-center mb-4">
          <div className="text-sm text-blue-600 font-medium">
            🚀 Building optimized index for faster loading...
          </div>
          <div className="text-xs text-gray-500 mt-1">
            This may take a moment on first load, then it will be much faster!
          </div>
        </div>

        {/* Loading skeleton for match cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && allMatches.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Matches</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadMatches(1, filter, yearFilter, false)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const remainingCount = totalCount - allMatches.length;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cricket Matches</h1>
        <div className="text-sm text-gray-600">
          Showing {allMatches.length} of {totalCount} matches
        </div>
      </div>

      {/* Match type filters */}
      {filterButtons}

      {/* Year filters */}
      {yearButtons}

      <div className="text-center mb-4">
        <div className="text-sm text-gray-600">
          📊 Filter: <span className="font-medium">{filter}</span> | 
          📅 Year: <span className="font-medium">{yearFilter}</span>
          {(filter !== 'all' || yearFilter !== 'all') && (
            <button
              onClick={() => {
                setFilter('all');
                setYearFilter('all');
                setAllMatches([]);
                setCurrentPage(1);
                setHasMoreData(true);
                loadMatches(1, 'all', 'all', false);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {allMatches.length === 0 && !loading ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <>
          {matchGrid}
          
          {/* Load More / End Message */}
          <div className="text-center mt-8">
            {hasMoreData ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : (
                  `Load More Matches (${remainingCount} remaining)`
                )}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
                <div className="flex items-center gap-2 text-green-800">
                  <span>✅</span>
                  <span className="font-medium">All matches loaded!</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  You've seen all {totalCount} matches for the current filter.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};