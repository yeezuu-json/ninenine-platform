import { useState, useEffect } from 'react';
import { useLottoGame } from '@ninenine/core-provider';
import { lotto80Service, RoundResult, ApiClientError } from '../services';

interface UseRoadmapResult {
  results: RoundResult[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRoadmap(): UseRoadmapResult {
  const [results, setResults] = useState<RoundResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSettled, roundId } = useLottoGame();

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await lotto80Service.getLastSettledRounds();
      setResults(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch roadmap data');
      }
      console.error('Roadmap fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchResults();
  }, []);

  // Refetch when a round settles
  useEffect(() => {
    if (isSettled) {
      fetchResults();
    }
  }, [isSettled, roundId]);

  return {
    results,
    loading,
    error,
    refetch: fetchResults,
  };
}
