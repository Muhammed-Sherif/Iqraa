import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { revisionService, WeakAyahItem } from '@/services';
import { MemorizationTask } from '@/core/types';
import { WeaknessChoice } from '@/core/revision/types';

export interface UseWeakAyatResult {
  weakAyat: WeakAyahItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  reinforcePassage: (
    taskId: number,
    weakness: WeaknessChoice,
  ) => Promise<MemorizationTask>;
}

/**
 * Hook to retrieve weak Ayat and launch focused reinforcement sessions.
 * Automatically refreshes silently on screen focus.
 *
 * @returns {UseWeakAyatResult} Weak Ayat list, loading state, refresh, and reinforcement session starter
 */
export function useWeakAyat(): UseWeakAyatResult {
  const [weakAyat, setWeakAyat] = useState<WeakAyahItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const hasLoadedRef = useRef<boolean>(false);
  const fetchSeqRef = useRef<number>(0);

  const fetchWeakAyat = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    try {
      const data = await revisionService.getWeakAyat();
      if (seq === fetchSeqRef.current) {
        setWeakAyat(data);
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
        .getWeakAyat()
        .then((data) => {
          if (isActive && seq === fetchSeqRef.current) {
            setWeakAyat(data);
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

  const reinforcePassage = useCallback(
    async (
      taskId: number,
      weakness: WeaknessChoice,
    ): Promise<MemorizationTask> => {
      const task = await revisionService.startFocusedMemorization(
        taskId,
        weakness,
      );
      await fetchWeakAyat();
      return task;
    },
    [fetchWeakAyat],
  );

  return {
    weakAyat,
    loading,
    error,
    refresh: fetchWeakAyat,
    reinforcePassage,
  };
}
