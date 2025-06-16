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

  // Helper function to get country flag emoji
  const getCountryFlag = (countryName: string): string => {
    const countryFlags: Record<string, string> = {
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Australia': '🇦🇺',
      'India': '🇮🇳',
      'Pakistan': '🇵🇰',
      'Bangladesh': '🇧🇩',
      'South Africa': '🇿🇦',
      'New Zealand': '🇳🇿',
      'Sri Lanka': '🇱🇰',
      'West Indies': '🏏',
      'Afghanistan': '🇦🇫',
      'Ireland': '🇮🇪',
      'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Netherlands': '🇳🇱',
      'Zimbabwe': '🇿🇼',
      'Kenya': '🇰🇪',
      'Canada': '🇨🇦',
      'Bermuda': '🇧🇲',
      'United Arab Emirates': '🇦🇪',
      'Nepal': '🇳🇵',
      'Namibia': '🇳🇦',
      'Papua New Guinea': '🇵🇬',
      'Jersey': '🇯🇪',
      'Guernsey': '🇬🇬',
      'Italy': '🇮🇹',
      'Germany': '🇩🇪',
      'China': '🇨🇳',
      'Malaysia': '🇲🇾',
      'Singapore': '🇸🇬',
      'Hong Kong': '🇭🇰',
      'Uganda': '🇺🇬',
      'Tanzania': '🇹🇿',
      'Botswana': '🇧🇼',
      'Rwanda': '🇷🇼',
      'Swaziland': '🇸🇿',
      'Nigeria': '🇳🇬',
      'Ghana': '🇬🇭'
    };
    return countryFlags[countryName] || '🏏';
  };

  return (
    <Link 
      href={`/analytics/${match.matchId}`}
      className="group block relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200 overflow-hidden"
    >
      {/* Header Section */}
      <div className="relative p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-md">
              <span className="w-1 h-1 bg-white rounded-full"></span>
              {match.info.match_type || 'Unknown'}
            </span>
            {match.info.team_type === 'international' && (
              <span className="inline-flex items-center bg-amber-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-md">
                🌍
              </span>
            )}
          </div>
          {match.info.dates?.[0] && (
            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
              {formatDate(match.info.dates[0])}
            </div>
          )}
        </div>
        
        {/* Teams Display */}
        {match.info.teams && (
          <div className="mb-2">
            <div className="flex items-center gap-2">
              {Array.isArray(match.info.teams) ? (
                <>
                  {/* Team 1 */}
                  <div className="flex-1">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{getCountryFlag(match.info.teams[0])}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-emerald-800 text-xs truncate">
                            {match.info.teams[0]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* VS Indicator */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                      <span className="text-xs font-bold text-gray-600">VS</span>
                    </div>
                  </div>
                  
                  {/* Team 2 */}
                  <div className="flex-1">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{getCountryFlag(match.info.teams[1])}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-blue-800 text-xs truncate">
                            {match.info.teams[1]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-center">
                  <span className="text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 text-xs">
                    🏏 Teams TBA
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Match Details Section */}
      <div className="px-3 pb-2">
        <div className="grid grid-cols-1 gap-1.5">
          {match.info.venue && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-xs">📍</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-gray-800 text-xs truncate">
                  {match.info.venue}{match.info.city && `, ${match.info.city}`}
                </div>
              </div>
            </div>
          )}
          
          {match.info.event && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-amber-100 rounded-md flex items-center justify-center">
                <span className="text-xs">🏆</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-gray-800 text-xs truncate">
                  {typeof match.info.event === 'string' ? match.info.event : match.info.event?.name || 'Event'}
                </div>
              </div>
            </div>
          )}
          
          {match.info.season && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-xs">📅</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-gray-800 text-xs">
                  Season {match.info.season}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Result/Footer Section */}
      <div className="px-3 pb-3">
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {outcome?.winner ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-700 text-xs">
                      🎉 {outcome.winner} Won
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600 text-xs">
                      {outcome?.result || 'No Result'}
                    </span>
                  </>
                )}
              </div>
              {match.info.player_of_match && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                    ⭐ POTM
                  </span>
                  <span className="text-xs text-gray-700 truncate">
                    {Array.isArray(match.info.player_of_match) ? 
                      match.info.player_of_match.join(', ') : match.info.player_of_match}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-shrink-0 ml-2">
              <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Link>
  );
});

MatchCard.displayName = 'MatchCard';

// Clean loading skeleton component
const LoadingSkeleton = React.memo(() => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    {/* Header skeleton */}
    <div className="p-6 pb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-lg w-16"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-20"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded-lg w-12"></div>
      </div>
      
      {/* Teams skeleton */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        
        <div className="flex-1">
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Details skeleton */}
    <div className="px-6 pb-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Footer skeleton */}
    <div className="px-6 pb-6 mt-2">
      <div className="bg-gray-100 rounded-xl p-3">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      </div>
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
    <div className="bg-gray-50 rounded-xl p-2 mb-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">🏏</span>
        <span className="text-xs font-semibold text-gray-700">Match Type</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All ({totalCount})
        </button>
        {availableMatchTypes.map(type => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              filter === type
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  ), [filter, totalCount, availableMatchTypes, handleFilterChange]);

  const yearButtons = useMemo(() => (
    <div className="bg-gray-50 rounded-xl p-2 mb-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">📅</span>
        <span className="text-xs font-semibold text-gray-700">Year</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => handleYearChange('all')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
            yearFilter === 'all'
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All Years
        </button>
        {availableYears.slice(0, 8).map(year => (
          <button
            key={year}
            onClick={() => handleYearChange(year)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
              yearFilter === year
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {year}
          </button>
        ))}
        {availableYears.length > 8 && (
          <span className="px-2.5 py-1 text-xs text-gray-500 bg-gray-100 rounded-md">
            +{availableYears.length - 8} more
          </span>
        )}
      </div>
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🏏</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cricket Matches</h1>
                    <p className="text-gray-600 text-sm">Loading data...</p>
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl px-4 py-3 w-20 h-16"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading skeleton for filter buttons */}
          <div className="bg-gray-50 rounded-2xl p-3 mb-6">
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-10 w-20 rounded-xl"></div>
              ))}
            </div>
          </div>

          <div className="text-center mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm text-blue-700 font-medium">
              🚀 Building optimized index...
            </div>
            <div className="text-xs text-blue-600 mt-1">
              This may take a moment on first load
            </div>
          </div>

          {/* Loading skeleton for match cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && allMatches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Matches</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => loadMatches(1, filter, yearFilter, false)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const remainingCount = totalCount - allMatches.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        {/* Minimal Header */}
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🏏</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Cricket Matches
                    </h1>
                    <p className="text-gray-600 text-xs">
                      International cricket with analytics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-green-700">Live</span>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    <span className="text-xs">🌍</span>
                    <span className="text-xs font-medium text-blue-700">Global</span>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    <span className="text-xs">📊</span>
                    <span className="text-xs font-medium text-purple-700">Analytics</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <div className="text-lg font-bold text-gray-900">
                    {allMatches.length}
                  </div>
                  <div className="text-xs text-gray-600">
                    of {totalCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Sections */}
        {filterButtons}
        {yearButtons}

        {/* Current Filter Status */}
        {(filter !== 'all' || yearFilter !== 'all') && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-blue-800">
                <span>🔍</span>
                <span>
                  Showing <strong>{filter}</strong> matches
                  {yearFilter !== 'all' && <> from <strong>{yearFilter}</strong></>}
                </span>
              </div>
              <button
                onClick={() => {
                  setFilter('all');
                  setYearFilter('all');
                  setAllMatches([]);
                  setCurrentPage(1);
                  setHasMoreData(true);
                  loadMatches(1, 'all', 'all', false);
                }}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {allMatches.length === 0 && !loading ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">🏏</div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No matches found</h3>
            <p className="text-gray-600 text-xs">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {matchGrid}
            
            {/* Load More / End Message */}
            <div className="text-center mt-6">
              {hasMoreData ? (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm text-sm"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : (
                    `Load More (${remainingCount})`
                  )}
                </button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 inline-block">
                  <div className="flex items-center gap-1.5 text-green-800">
                    <span>✅</span>
                    <span className="font-medium text-xs">All {totalCount} matches loaded</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};