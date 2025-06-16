import React from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';

interface MatchHeaderProps {
  match: CricketMatch;
  showDetails?: boolean;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({ match, showDetails = true }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getResultText = () => {
    const outcome = match.info.outcome;
    if (outcome?.winner) {
      let resultText = `${outcome.winner} won`;
      if (outcome.by?.runs) {
        resultText += ` by ${outcome.by.runs} runs`;
      } else if (outcome.by?.wickets) {
        resultText += ` by ${outcome.by.wickets} wickets`;
      }
      if (outcome.method) {
        resultText += ` (${outcome.method})`;
      }
      return resultText;
    }
    return outcome?.result || 'Match result not available';
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        {/* Main Teams Display */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {match.info.teams.join(' vs ')}
          </h1>
          <div className="text-lg opacity-90">
            {match.info.event && (
              typeof match.info.event === 'string' 
                ? match.info.event 
                : match.info.event.name
            )}
          </div>
        </div>

        {/* Match Result */}
        <div className="text-center mb-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 inline-block">
            <div className="text-xl font-semibold">{getResultText()}</div>
          </div>
        </div>

        {/* Match Details Grid */}
        {showDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white bg-opacity-10 rounded p-3">
              <div className="font-semibold mb-1">📅 Date</div>
              <div>{match.info.dates?.[0] ? formatDate(match.info.dates[0]) : 'Date TBD'}</div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded p-3">
              <div className="font-semibold mb-1">📍 Venue</div>
              <div>
                {match.info.venue}
                {match.info.city && `, ${match.info.city}`}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded p-3">
              <div className="font-semibold mb-1">🏏 Format</div>
              <div>
                {match.info.match_type}
                {match.info.overs && ` (${match.info.overs} overs)`}
              </div>
            </div>
          </div>
        )}

        {/* Additional Info Row */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm opacity-90">
          {match.info.season && (
            <span className="bg-white bg-opacity-10 px-3 py-1 rounded-full">
              Season {match.info.season}
            </span>
          )}
          
          {match.info.player_of_match && (
            <span className="bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full">
              🏆 {Array.isArray(match.info.player_of_match) 
                ? match.info.player_of_match.join(', ') 
                : match.info.player_of_match}
            </span>
          )}
          
          {match.info.toss && (
            <span className="bg-white bg-opacity-10 px-3 py-1 rounded-full">
              Toss: {match.info.toss.winner} ({match.info.toss.decision})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}; 