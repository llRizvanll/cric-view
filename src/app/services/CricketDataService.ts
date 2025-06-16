import { CricketMatch } from '../models/CricketMatchModel';

export class CricketDataService {
  private static instance: CricketDataService;
  private matchData: Map<string, CricketMatch> = new Map();

  private constructor() {}

  public static getInstance(): CricketDataService {
    if (!CricketDataService.instance) {
      CricketDataService.instance = new CricketDataService();
    }
    return CricketDataService.instance;
  }

  public async loadMatchData(matchId: string): Promise<CricketMatch> {
    if (this.matchData.has(matchId)) {
      return this.matchData.get(matchId)!;
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/matches/${matchId}`);
      if (!response.ok) {
        throw new Error('Failed to load match data');
      }

      const data = await response.json();
      this.matchData.set(matchId, data);
      return data;
    } catch (error) {
      console.error('Error loading match data:', error);
      throw error;
    }
  }

  public async loadAllMatches(): Promise<CricketMatch[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/matches');
      if (!response.ok) {
        throw new Error('Failed to load matches');
      }

      const data = await response.json();
      data.forEach((match: CricketMatch) => {
        this.matchData.set(match.meta.data_version, match);
      });
      return data;
    } catch (error) {
      console.error('Error loading matches:', error);
      throw error;
    }
  }

  public getMatchData(matchId: string): CricketMatch | undefined {
    return this.matchData.get(matchId);
  }

  public clearCache(): void {
    this.matchData.clear();
  }
} 