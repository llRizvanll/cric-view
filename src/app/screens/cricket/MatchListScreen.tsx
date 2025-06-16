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
      className="group block relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-1 overflow-hidden"
    >
      {/* Background gradient overlay for modern look */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Header Section */}
      <div className="relative p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {match.info.match_type || 'Unknown'}
            </span>
            {match.info.team_type === 'international' && (
              <span className="inline-flex items-center bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                🌍 International
              </span>
            )}
          </div>
          {match.info.dates?.[0] && (
            <div className="text-right">
              <div className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                {formatDate(match.info.dates[0])}
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Country Names - Premium Display */}
        {match.info.teams && (
          <div className="mb-4">
            <div className="flex items-center gap-4">
              {Array.isArray(match.info.teams) ? (
                <>
                  {/* Team 1 */}
                  <div className="flex-1 group/team">
                    <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-xl p-4 transition-all duration-200 group-hover/team:border-emerald-300 group-hover/team:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl group-hover/team:scale-110 transition-transform duration-200">
                          {getCountryFlag(match.info.teams[0])}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-emerald-800 text-base truncate">
                            {match.info.teams[0]}
                          </div>
                          <div className="text-xs text-emerald-600 font-medium">
                            Home Team
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* VS Indicator */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xs font-black text-gray-600">VS</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-xs">⚡</span>
                    </div>
                  </div>
                  
                  {/* Team 2 */}
                  <div className="flex-1 group/team">
                    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-4 transition-all duration-200 group-hover/team:border-blue-300 group-hover/team:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl group-hover/team:scale-110 transition-transform duration-200">
                          {getCountryFlag(match.info.teams[1])}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-blue-800 text-base truncate">
                            {match.info.teams[1]}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            Away Team
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-center">
                  <span className="font-medium text-gray-500 bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 rounded-xl border border-gray-300">
                    🏏 Teams To Be Announced
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Match Details Section */}
      <div className="relative px-6 pb-4">
        <div className="grid grid-cols-1 gap-3">
          {match.info.venue && (
            <div className="flex items-center gap-3 group/venue">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover/venue:scale-110 transition-transform duration-200">
                <span className="text-sm">📍</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-800 text-sm truncate">
                  {match.info.venue}
                </div>
                {match.info.city && (
                  <div className="text-xs text-gray-500">
                    {match.info.city}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {match.info.event && (
            <div className="flex items-center gap-3 group/event">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center group-hover/event:scale-110 transition-transform duration-200">
                <span className="text-sm">🏆</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-800 text-sm truncate">
                  {typeof match.info.event === 'string' ? match.info.event : match.info.event?.name || 'Event'}
                </div>
                <div className="text-xs text-gray-500">
                  Tournament
                </div>
              </div>
            </div>
          )}
          
          {match.info.season && (
            <div className="flex items-center gap-3 group/season">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg flex items-center justify-center group-hover/season:scale-110 transition-transform duration-200">
                <span className="text-sm">📅</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-800 text-sm">
                  {match.info.season}
                </div>
                <div className="text-xs text-gray-500">
                  Season
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Result/Footer Section */}
      <div className="relative mt-2 px-6 pb-6">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {outcome?.winner ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-green-700 text-sm">
                      🎉 {outcome.winner} Won
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-600 text-sm">
                      {outcome?.result || 'No Result'}
                    </span>
                  </>
                )}
              </div>
              {match.info.player_of_match && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                    ⭐ Player of the Match
                  </span>
                  <span className="text-xs text-gray-700 font-medium truncate">
                    {Array.isArray(match.info.player_of_match) ? 
                      match.info.player_of_match.join(', ') : match.info.player_of_match}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-lg">📊</span>
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

// Enhanced loading skeleton component
const LoadingSkeleton = React.memo(() => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    {/* Header skeleton */}
    <div className="p-6 pb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
          <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-lg w-16"></div>
      </div>
      
      {/* Teams skeleton */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
        
        <div className="flex-1">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Details skeleton */}
    <div className="px-6 pb-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Footer skeleton */}
    <div className="px-6 pb-6 mt-2">
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto p-4 md:p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/10 to-teal-400/10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🏏</span>
                  </div>
                  <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Cricket Matches
                    </h1>
                    <p className="text-gray-600 font-medium">
                      International cricket with live analytics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-emerald-700">Live Updates</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                    <span className="text-xs">🌍</span>
                    <span className="text-xs font-semibold text-blue-700">Global Coverage</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                    <span className="text-xs">📊</span>
                    <span className="text-xs font-semibold text-purple-700">Enhanced Analytics</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-200/50">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {allMatches.length}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    of {totalCount} matches
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  <span>Updated in real-time</span>
                </div>
              </div>
            </div>
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
    </div>
  );
};