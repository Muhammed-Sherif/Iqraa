import { useEffect, useState } from 'react';
import { quranSeedService } from '@/services';

export type SeedStatus = 'idle' | 'seeding' | 'done' | 'error';

/**
 * Runs the Quran seed exactly once — only when the `surahs` table is not yet seeded.
 * Follows layer separation: UI -> Hook -> Service -> DB Repository -> SQLite.
 *
 * @returns {{ status: SeedStatus; error: Error | null }} Current seeding status and error object if any.
 */
export function useQuranSeed(): { status: SeedStatus; error: Error | null } {
  const [status, setStatus] = useState<SeedStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const isSeeded = await quranSeedService.isSeeded();

        if (isSeeded) {
          if (!cancelled) setStatus('done');
          return;
        }

        if (!cancelled) setStatus('seeding');
        await quranSeedService.seed();
        if (!cancelled) setStatus('done');
      } catch (err) {
        console.error('[useQuranSeed] Failed to seed Quran:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus('error');
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, error };
}
