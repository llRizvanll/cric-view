'use client';

import React from 'react';
import { CricketMatch } from '../../models/CricketMatchModel';
import { CricketAnalyticsViewModel } from '../../viewmodels/CricketAnalyticsViewModel';

interface CricketInsightsProps {
  match: CricketMatch;
  viewModel: CricketAnalyticsViewModel;
}

export const CricketInsights: React.FC<CricketInsightsProps> = ({ match, viewModel }) => {
  // Calculate deep insights
  const calculateInsights = () => {
    const insights = [];
    
    // Analyze batting performances
    if (match.innings && match.innings.length > 0) {
      const allBatsmen = viewModel.getTopBatsmen(20);
      const allBowlers = viewModel.getTopBowlers(20);
      
      // Strike rate analysis
      const highStrikeRates = allBatsmen.filter(b => b.strikeRate > 150);
      if (highStrikeRates.length > 0) {
        insights.push({
          type: 'batting',
          icon: '⚡',
          title: 'Explosive Batting',
          description: `${highStrikeRates.length} player(s) maintained a strike rate above 150`,
          details: `Highest: ${highStrikeRates[0]?.name} (${highStrikeRates[0]?.strikeRate.toFixed(1)})`
        });
      }
      
      // Duck analysis
      const ducks = allBatsmen.filter(b => b.runs === 0 && b.balls > 0);
      if (ducks.length > 0) {
        insights.push({
          type: 'batting',
          icon: '🦆',
          title: 'Duck Alert',
          description: `${ducks.length} player(s) got out for duck`,
          details: ducks.map(d => d.name).join(', ')
        });
      }
      
      // Century/Half-century analysis
      const centuries = allBatsmen.filter(b => b.runs >= 100);
      const halfCenturies = allBatsmen.filter(b => b.runs >= 50 && b.runs < 100);
      
      if (centuries.length > 0) {
        insights.push({
          type: 'batting',
          icon: '💯',
          title: 'Century Makers',
          description: `${centuries.length} century scored in this match`,
          details: centuries.map(c => `${c.name} (${c.runs})`).join(', ')
        });
      }
      
      if (halfCenturies.length > 0) {
        insights.push({
          type: 'batting',
          icon: '🏏',
          title: 'Half Century Club',
          description: `${halfCenturies.length} half-centuries scored`,
          details: halfCenturies.map(h => `${h.name} (${h.runs})`).join(', ')
        });
      }
      
      // Bowling analysis
      const fiveWickets = allBowlers.filter(b => b.wickets >= 5);
      const hatricks = allBowlers.filter(b => b.wickets >= 3 && b.overs <= 1);
      
      if (fiveWickets.length > 0) {
        insights.push({
          type: 'bowling',
          icon: '🎳',
          title: 'Five-for Achieved',
          description: `${fiveWickets.length} bowler(s) took 5+ wickets`,
          details: fiveWickets.map(f => `${f.name} (${f.wickets}/${f.runs})`).join(', ')
        });
      }
      
      // Economy analysis
      const economical = allBowlers.filter(b => b.economy < 4 && b.overs >= 3);
      if (economical.length > 0) {
        insights.push({
          type: 'bowling',
          icon: '🛡️',
          title: 'Economical Bowling',
          description: `${economical.length} bowler(s) with economy under 4.0`,
          details: `Best: ${economical[0]?.name} (${economical[0]?.economy.toFixed(2)})`
        });
      }
      
      // Expensive bowling
      const expensive = allBowlers.filter(b => b.economy > 10 && b.overs >= 2);
      if (expensive.length > 0) {
        insights.push({
          type: 'bowling',
          icon: '💸',
          title: 'Expensive Spells',
          description: `${expensive.length} bowler(s) conceded 10+ runs per over`,
          details: `Most expensive: ${expensive[0]?.name} (${expensive[0]?.economy.toFixed(2)})`
        });
      }
      
      // Match momentum insights
      if (match.innings.length >= 2) {
        const team1Total = match.innings[0] ? calculateTeamTotal(match.innings[0]) : 0;
        const team2Total = match.innings[1] ? calculateTeamTotal(match.innings[1]) : 0;
        const margin = Math.abs(team1Total - team2Total);
        
        if (margin < 10) {
          insights.push({
            type: 'match',
            icon: '🔥',
            title: 'Nail-biting Finish',
            description: `Match decided by just ${margin} runs`,
            details: 'One of the closest contests you\'ll ever see!'
          });
        } else if (margin > 100) {
          insights.push({
            type: 'match',
            icon: '💪',
            title: 'Dominant Performance',
            description: `Winning margin of ${margin}+ runs`,
            details: 'A comprehensive victory!'
          });
        }
      }
      
      // Boundary analysis
      const boundaryInsights = analyzeBoundaries();
      if (boundaryInsights) {
        insights.push(boundaryInsights);
      }
    }
    
    return insights;
  };
  
  const calculateTeamTotal = (innings: any) => {
    let total = 0;
    innings.overs?.forEach((over: any) => {
      over.deliveries?.forEach((delivery: any) => {
        total += delivery.runs?.total || 0;
      });
    });
    return total;
  };
  
  const analyzeBoundaries = () => {
    let totalFours = 0;
    let totalSixes = 0;
    
    match.innings?.forEach(innings => {
      innings.overs?.forEach(over => {
        over.deliveries?.forEach(delivery => {
          if (delivery.runs?.batter === 4) totalFours++;
          if (delivery.runs?.batter === 6) totalSixes++;
        });
      });
    });
    
    const boundaryRuns = (totalFours * 4) + (totalSixes * 6);
    const totalRuns = match.innings?.reduce((sum, innings) => sum + calculateTeamTotal(innings), 0) || 0;
    const boundaryPercentage = totalRuns > 0 ? (boundaryRuns / totalRuns) * 100 : 0;
    
    if (totalFours + totalSixes > 20) {
      return {
        type: 'batting',
        icon: '💥',
        title: 'Boundary Bonanza',
        description: `${totalFours + totalSixes} boundaries hit (${totalFours} fours, ${totalSixes} sixes)`,
        details: `${boundaryPercentage.toFixed(1)}% of runs came from boundaries`
      };
    }
    
    return null;
  };
  
  const insights = calculateInsights();
  
  if (insights.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>🔍</span>
          Cricket Insights
        </h3>
        <div className="text-center py-6">
          <span className="text-gray-400 text-sm">No special insights detected for this match</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>🔍</span>
        Cricket Insights & Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
              insight.type === 'batting' 
                ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-400/50'
                : insight.type === 'bowling'
                ? 'bg-red-500/10 border-red-500/30 hover:border-red-400/50'
                : 'bg-purple-500/10 border-purple-500/30 hover:border-purple-400/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{insight.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm mb-1">{insight.title}</h4>
                <p className="text-gray-300 text-xs mb-2">{insight.description}</p>
                <p className="text-gray-400 text-xs italic">{insight.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Fun cricket facts */}
      <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
        <h4 className="font-semibold text-amber-300 text-sm mb-2 flex items-center gap-2">
          <span>💡</span>
          Did You Know?
        </h4>
        <p className="text-amber-200 text-xs">
          This match features teams that have collectively played {match.info.teams?.length || 2} different formats of cricket. 
          {match.info.venue && ` The venue "${match.info.venue}" has witnessed countless cricket battles throughout history.`}
          {match.info.event && ` This match is part of the prestigious ${typeof match.info.event === 'string' ? match.info.event : match.info.event?.name} tournament.`}
        </p>
      </div>
    </div>
  );
}; 