import { 
  CricketMatch, 
  CricketDelivery, 
  CricketInnings, 
  PlayerStats, 
  BowlingStats, 
  TeamStats,
  MatchSummary 
} from '../models/CricketMatchModel';

export class CricketAnalyticsViewModel {
  private matchData: CricketMatch;

  constructor(matchData: CricketMatch) {
    this.matchData = matchData;
  }

  // Get comprehensive match summary
  getMatchSummary(): MatchSummary {
    const teamStats = this.getTeamStats();
    const result = this.formatResult();
    
    return {
      teams: this.matchData.info.teams,
      venue: this.matchData.info.venue,
      date: this.matchData.info.dates[0],
      matchType: this.matchData.info.match_type,
      result,
      playerOfMatch: this.matchData.info.player_of_match?.[0],
      teamStats
    };
  }

  // Format match result
  private formatResult(): string {
    const outcome = this.matchData.info.outcome;
    if (outcome.by?.runs) {
      return `${outcome.winner} won by ${outcome.by.runs} runs`;
    } else if (outcome.by?.wickets) {
      return `${outcome.winner} won by ${outcome.by.wickets} wickets`;
    } else {
      return `${outcome.winner} won`;
    }
  }

  // Get comprehensive team statistics
  getTeamStats(): TeamStats[] {
    return this.matchData.innings.map(innings => {
      let totalRuns = 0;
      let totalWickets = 0;
      let boundaries = 0;
      let sixes = 0;
      let ballsFaced = 0;

      innings.overs.forEach(over => {
        over.deliveries.forEach(delivery => {
          totalRuns += delivery.runs.total;
          ballsFaced++;
          
          if (delivery.runs.batter === 4) boundaries++;
          if (delivery.runs.batter === 6) sixes++;
          if (delivery.wickets) totalWickets += delivery.wickets.length;
        });
      });

      const totalOvers = innings.overs.length;
      const runRate = ballsFaced > 0 ? (totalRuns / ballsFaced) * 6 : 0;

      return {
        team: innings.team,
        totalRuns,
        totalWickets,
        totalOvers,
        runRate: Math.round(runRate * 100) / 100,
        boundaries,
        sixes
      };
    });
  }

  // Get top batsmen statistics
  getTopBatsmen(limit: number = 10): PlayerStats[] {
    const playerStats = new Map<string, PlayerStats>();

    this.matchData.innings.forEach(innings => {
      innings.overs.forEach(over => {
        over.deliveries.forEach(delivery => {
          const playerName = delivery.batter;
          
          if (!playerStats.has(playerName)) {
            playerStats.set(playerName, {
              name: playerName,
              runs: 0,
              balls: 0,
              boundaries: 0,
              sixes: 0,
              dismissals: 0,
              strikeRate: 0,
              average: 0
            });
          }

          const stats = playerStats.get(playerName)!;
          stats.runs += delivery.runs.batter;
          stats.balls++;

          if (delivery.runs.batter === 4) stats.boundaries++;
          if (delivery.runs.batter === 6) stats.sixes++;
          if (delivery.wickets?.some(w => w.player_out === playerName)) {
            stats.dismissals++;
          }
        });
      });
    });

    // Calculate derived statistics
    playerStats.forEach(stats => {
      stats.strikeRate = stats.balls > 0 ? Math.round((stats.runs / stats.balls) * 10000) / 100 : 0;
      stats.average = stats.dismissals > 0 ? Math.round((stats.runs / stats.dismissals) * 100) / 100 : stats.runs;
    });

    return Array.from(playerStats.values())
      .sort((a, b) => b.runs - a.runs)
      .slice(0, limit);
  }

  // Get top bowlers statistics
  getTopBowlers(limit: number = 10): BowlingStats[] {
    const bowlerStats = new Map<string, BowlingStats>();

    this.matchData.innings.forEach(innings => {
      innings.overs.forEach(over => {
        over.deliveries.forEach(delivery => {
          const bowlerName = delivery.bowler;
          
          if (!bowlerStats.has(bowlerName)) {
            bowlerStats.set(bowlerName, {
              name: bowlerName,
              runs: 0,
              balls: 0,
              wickets: 0,
              extras: 0,
              economy: 0,
              average: 0,
              overs: 0
            });
          }

          const stats = bowlerStats.get(bowlerName)!;
          stats.runs += delivery.runs.total;
          stats.balls++;
          stats.extras += delivery.runs.extras;
          
          if (delivery.wickets) {
            stats.wickets += delivery.wickets.length;
          }
        });
      });
    });

    // Calculate derived statistics
    bowlerStats.forEach(stats => {
      stats.overs = Math.round((stats.balls / 6) * 10) / 10;
      stats.economy = stats.balls > 0 ? Math.round((stats.runs / stats.balls) * 600) / 100 : 0;
      stats.average = stats.wickets > 0 ? Math.round((stats.runs / stats.wickets) * 100) / 100 : 0;
    });

    return Array.from(bowlerStats.values())
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, limit);
  }

  // Get over-by-over progression for charts
  getOverByOverProgression() {
    return this.matchData.innings.map(innings => {
      let cumulativeRuns = 0;
      let cumulativeWickets = 0;

      const progression = innings.overs.map(over => {
        const overRuns = over.deliveries.reduce((sum, delivery) => sum + delivery.runs.total, 0);
        const overWickets = over.deliveries.reduce((sum, delivery) => 
          sum + (delivery.wickets?.length || 0), 0);
        
        cumulativeRuns += overRuns;
        cumulativeWickets += overWickets;

        return {
          over: over.over + 1,
          runs: overRuns,
          totalRuns: cumulativeRuns,
          wickets: overWickets,
          totalWickets: cumulativeWickets,
          runRate: Math.round((cumulativeRuns / ((over.over + 1) * 6)) * 600) / 100
        };
      });

      return {
        team: innings.team,
        progression
      };
    });
  }

  // Get partnership analysis
  getPartnershipAnalysis() {
    const partnerships: Array<{
      batters: [string, string];
      runs: number;
      balls: number;
      team: string;
    }> = [];

    this.matchData.innings.forEach(innings => {
      let currentBatters = new Set<string>();
      let partnershipRuns = 0;
      let partnershipBalls = 0;
      let batsmenPair: [string, string] = ['', ''];

      innings.overs.forEach(over => {
        over.deliveries.forEach(delivery => {
          // Track current batsmen
          currentBatters.add(delivery.batter);
          currentBatters.add(delivery.non_striker);

          if (batsmenPair[0] === '') {
            batsmenPair = [delivery.batter, delivery.non_striker];
          }

          // Add runs and balls to current partnership
          partnershipRuns += delivery.runs.batter;
          partnershipBalls++;

          // If wicket falls, record partnership and reset
          if (delivery.wickets?.length) {
            if (partnershipRuns > 0) {
              partnerships.push({
                batters: [...batsmenPair],
                runs: partnershipRuns,
                balls: partnershipBalls,
                team: innings.team
              });
            }
            
            // Reset for new partnership
            partnershipRuns = 0;
            partnershipBalls = 0;
            batsmenPair = ['', ''];
            currentBatters.clear();
          }
        });
      });

      // Add final partnership if no wicket at end
      if (partnershipRuns > 0 && batsmenPair[0] !== '') {
        partnerships.push({
          batters: [...batsmenPair],
          runs: partnershipRuns,
          balls: partnershipBalls,
          team: innings.team
        });
      }
    });

    return partnerships.sort((a, b) => b.runs - a.runs);
  }

  // Get wicket analysis
  getWicketAnalysis() {
    const wicketTypes = new Map<string, number>();
    const wicketsByOver = new Map<number, number>();
    
    this.matchData.innings.forEach(innings => {
      innings.overs.forEach(over => {
        let overWickets = 0;
        
        over.deliveries.forEach(delivery => {
          if (delivery.wickets) {
            delivery.wickets.forEach(wicket => {
              // Count wicket types
              const wicketType = wicket.kind;
              wicketTypes.set(wicketType, (wicketTypes.get(wicketType) || 0) + 1);
              overWickets++;
            });
          }
        });
        
        if (overWickets > 0) {
          wicketsByOver.set(over.over + 1, overWickets);
        }
      });
    });

    return {
      wicketTypes: Array.from(wicketTypes.entries()).map(([type, count]) => ({
        name: type,
        value: count
      })),
      wicketsByOver: Array.from(wicketsByOver.entries()).map(([over, wickets]) => ({
        over,
        wickets
      }))
    };
  }

  // Get boundary analysis
  getBoundaryAnalysis() {
    const boundaryData = this.matchData.innings.map(innings => {
      let fours = 0;
      let sixes = 0;
      const overBoundaries = new Map<number, { fours: number; sixes: number }>();

      innings.overs.forEach(over => {
        let overFours = 0;
        let overSixes = 0;

        over.deliveries.forEach(delivery => {
          if (delivery.runs.batter === 4) {
            fours++;
            overFours++;
          } else if (delivery.runs.batter === 6) {
            sixes++;
            overSixes++;
          }
        });

        if (overFours > 0 || overSixes > 0) {
          overBoundaries.set(over.over + 1, { fours: overFours, sixes: overSixes });
        }
      });

      return {
        team: innings.team,
        fours,
        sixes,
        total: fours + sixes,
        overBoundaries: Array.from(overBoundaries.entries()).map(([over, bounds]) => ({
          over,
          ...bounds
        }))
      };
    });

    return {
      byTeam: boundaryData,
      total: {
        fours: boundaryData.reduce((sum, team) => sum + team.fours, 0),
        sixes: boundaryData.reduce((sum, team) => sum + team.sixes, 0)
      }
    };
  }
} 