import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { memorizationService } from '@/services';
import { MemorizationTask } from '@/core/types';

export interface UseMemorizationTasksResult {
  tasks: MemorizationTask[];
  surahNames: Record<number, string>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch today's memorization tasks and surah names from memorizationService.
 * Follows layer separation: UI -> Hook -> Service -> DB Repository -> SQLite.
 *
 * @returns {UseMemorizationTasksResult} Today's tasks, surah names map, loading state, error, and refresh handler.
 */
export function useMemorizationTasks(): UseMemorizationTasksResult {
  const [tasks, setTasks] = useState<MemorizationTask[]>([]);
  const [surahNames, setSurahNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const hasLoadedRef = useRef<boolean>(false);
  const fetchSeqRef = useRef<number>(0);

  const fetchTasks = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    try {
      const [fetchedTasks, fetchedNames] = await Promise.all([
        memorizationService.getTodayMemorizationTasks(),
        memorizationService.getSurahNames(),
      ]);

      if (seq === fetchSeqRef.current) {
        setTasks(fetchedTasks);
        setSurahNames(fetchedNames);
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

      Promise.all([
        memorizationService.getTodayMemorizationTasks(),
        memorizationService.getSurahNames(),
      ])
        .then(([fetchedTasks, fetchedNames]) => {
          if (isActive && seq === fetchSeqRef.current) {
            setTasks(fetchedTasks);
            setSurahNames(fetchedNames);
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
    tasks,
    surahNames,
    loading,
    error,
    refresh: fetchTasks,
  };
}
