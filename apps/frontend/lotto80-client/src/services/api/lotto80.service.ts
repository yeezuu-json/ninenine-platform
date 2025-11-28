import { apiClient } from '../api-client';

/**
 * Lotto80 API Types
 */
export interface RoundResult {
  id: string;
  ouResult: 'OVER' | 'UNDER';
  rangeResult: 'RANGE_1' | 'RANGE_2' | 'RANGE_3' | 'RANGE_4' | 'RANGE_5';
  totalSum?: number;
  drawnNumbers?: number[];
  createdAt?: string;
}

export interface CurrentRound {
  roundId: string;
  status: 'OPEN' | 'DRAWING' | 'FINISHED' | 'SETTLED';
  countdownSeconds: number;
  drawnNumbers: number[];
  totalSum: number;
  ouResult: 'OVER' | 'UNDER' | null;
  rangeResult: string | null;
}

export interface PlaceBetRequest {
  roundId: string;
  betType:
    | 'OVER'
    | 'UNDER'
    | 'RANGE_1'
    | 'RANGE_2'
    | 'RANGE_3'
    | 'RANGE_4'
    | 'RANGE_5';
  amount: number;
}

export interface PlaceBetResponse {
  betId: string;
  roundId: string;
  betType: string;
  amount: number;
  potentialWin: number;
  status: string;
}

/**
 * Lotto80 API Service
 */
export class Lotto80Service {
  /**
   * Get current round snapshot
   */
  async getCurrentRound(): Promise<CurrentRound> {
    const response = await apiClient.get<CurrentRound>(
      '/lotto80/current-round'
    );
    return response.data;
  }

  /**
   * Get last N round results
   */
  async getLastResults(limit = 10): Promise<RoundResult[]> {
    const response = await apiClient.get<RoundResult[]>(
      '/lotto80/last-results',
      {
        params: { limit },
      }
    );
    return response.data;
  }

  /**
   * Get last ten settled rounds for roadmap
   */
  async getLastSettledRounds(): Promise<RoundResult[]> {
    const response = await apiClient.get<RoundResult[]>(
      '/lotto80/last-settled-rounds'
    );
    return response.data;
  }

  /**
   * Get round history with pagination
   */
  async getRoundHistory(
    page = 1,
    pageSize = 20
  ): Promise<{
    results: RoundResult[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const response = await apiClient.get<{
      results: RoundResult[];
      total: number;
      page: number;
      pageSize: number;
    }>('/lotto80/history', {
      params: { page, pageSize },
    });
    return response.data;
  }

  /**
   * Get specific round by ID
   */
  async getRoundById(roundId: string): Promise<RoundResult> {
    const response = await apiClient.get<RoundResult>(
      `/lotto80/rounds/${roundId}`
    );
    return response.data;
  }

  /**
   * Place a bet
   */
  async placeBet(bet: PlaceBetRequest): Promise<PlaceBetResponse> {
    const response = await apiClient.post<PlaceBetResponse, PlaceBetRequest>(
      '/lotto80/bets',
      {
        body: bet,
      }
    );
    return response.data;
  }

  /**
   * Get user's bets for a round
   */
  async getUserBets(roundId: string): Promise<PlaceBetResponse[]> {
    const response = await apiClient.get<PlaceBetResponse[]>('/lotto80/bets', {
      params: { roundId },
    });
    return response.data;
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    totalRounds: number;
    overCount: number;
    underCount: number;
    rangeDistribution: Record<string, number>;
  }> {
    const response = await apiClient.get<{
      totalRounds: number;
      overCount: number;
      underCount: number;
      rangeDistribution: Record<string, number>;
    }>('/lotto80/statistics');
    return response.data;
  }
}

/**
 * Default Lotto80 service instance
 */
export const lotto80Service = new Lotto80Service();
