export interface CricketMatchMeta {
  data_version: string;
  created: string;
  revision: number;
}

export interface CricketMatchEvent {
  match_number?: number;
  name: string;
  group?: string;
  stage?: string;
  sub_name?: string;
}

export interface CricketMatchOfficials {
  match_referees?: string[];
  reserve_umpires?: string[];
  tv_umpires?: string[];
  umpires?: string[];
}

export interface CricketMatchOutcome {
  by?: {
    wickets?: number;
    runs?: number;
    innings?: number;
  };
  method?: string;
  winner?: string;
  result?: string;
}

export interface CricketMatchToss {
  decision: string;
  winner: string;
}

export interface CricketMatchInfo {
  balls_per_over?: number;
  city?: string;
  dates: string[];
  event: CricketMatchEvent;
  gender: string;
  match_type: string;
  match_type_number?: number;
  officials?: CricketMatchOfficials;
  outcome: CricketMatchOutcome;
  overs?: number;
  player_of_match?: string[];
  players?: Record<string, string[]>;
  registry?: {
    people: Record<string, string>;
  };
  season?: string;
  team_type?: string;
  teams: string[];
  toss?: CricketMatchToss;
  venue?: string;
}

export interface CricketReview {
  by: string;
  umpire: string;
  batter: string;
  decision: string;
  type: string;
}

export interface CricketExtras {
  wides?: number;
  noballs?: number;
  legbyes?: number;
  byes?: number;
}

export interface CricketWicket {
  player_out: string;
  kind: string;
  fielders?: Array<{
    name: string;
  }>;
}

export interface CricketDelivery {
  batter: string;
  bowler: string;
  non_striker: string;
  runs: {
    batter: number;
    extras: number;
    total: number;
  };
  extras?: CricketExtras;
  wickets?: CricketWicket[];
  review?: CricketReview;
}

export interface CricketOver {
  over: number;
  deliveries: CricketDelivery[];
}

export interface CricketInnings {
  team: string;
  overs: CricketOver[];
}

export interface CricketMatch {
  meta: CricketMatchMeta;
  info: CricketMatchInfo;
  innings?: CricketInnings[];
  matchId?: string;
}

// Analytics interfaces
export interface PlayerStats {
  name: string;
  runs: number;
  balls: number;
  boundaries: number;
  sixes: number;
  dismissals: number;
  strikeRate: number;
  average: number;
}

export interface BowlingStats {
  name: string;
  runs: number;
  balls: number;
  wickets: number;
  extras: number;
  economy: number;
  average: number;
  overs: number;
}

export interface TeamStats {
  team: string;
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  runRate: number;
  boundaries: number;
  sixes: number;
}

export interface MatchSummary {
  teams: string[];
  venue: string;
  date: string;
  matchType: string;
  result: string;
  playerOfMatch?: string;
  teamStats: TeamStats[];
} 