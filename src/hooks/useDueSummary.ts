import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { revisionService, DueSummary } from '@/services';

export interface UseDueSummaryResult {
  summary: DueSummary | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and track today's revision session summary and task counts.
 * Automatically refreshes silently when the screen gains focus.
 *
 * @returns {UseDueSummaryResult} Revision metrics, loading/error states, and manual refresh
 */
export function useDueSummary(): UseDueSummaryResult {
  const [summary, setSummary] = useState<DueSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const hasLoadedRef = useRef<boolean>(false);
  const fetchSeqRef = useRef<number>(0);

  const fetchSummary = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    try {
      const data = await revisionService.getDueSummary();
      if (seq === fetchSeqRef.current) {
        setSummary(data);
        setError(null);
      }
    } catch (err) {
      if (seq === fetchSeqRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (seq === fetchSeqRef.current) {
        hasLoadedRef.current = true;
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const seq = ++fetchSeqRef.current;

      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      revisionService
        .getDueSummary()
        .then((data) => {
          if (isActive && seq === fetchSeqRef.current) {
            setSummary(data);
            setError(null);
          }
        })
        .catch((err) => {
          if (isActive && seq === fetchSeqRef.current) {
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        })
        .finally(() => {
          if (isActive && seq === fetchSeqRef.current) {
            hasLoadedRef.current = true;
            setLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary,
  };
}
