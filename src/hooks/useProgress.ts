import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { progressService } from '@/services';
import { Progress } from '@/core/types';

export interface UseProgressResult {
  progress: Progress | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useProgress(): UseProgressResult {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const hasLoadedRef = useRef<boolean>(false);
  const fetchSeqRef = useRef<number>(0);

  const fetchProgress = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    try {
      const data = await progressService.getProgress();
      if (seq === fetchSeqRef.current) {
        setProgress(data);
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

      progressService
        .getProgress()
        .then((data) => {
          if (isActive && seq === fetchSeqRef.current) {
            setProgress(data);
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
    progress,
    loading,
    error,
    refresh: fetchProgress,
  };
}
