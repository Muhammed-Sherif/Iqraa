import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { audioService } from '@/services';

/**
 * Hook to check if audio is downloaded and conditionally redirect to /download-audio.
 * Follows layer separation: UI -> Hook -> Service -> DB Repository -> SQLite.
 *
 * @param reciter - Reciter ID.
 * @param surahNumber - Optional surah number to check.
 * @returns Status of download, loading flag, and check/redirect handlers.
 */
export function useAudioDownloadCheck(reciter: string, surahNumber?: number) {
  const router = useRouter();
  const [isDownloaded, setIsDownloaded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    setLoading(true);
    const downloaded = await audioService.isAudioDownloaded(reciter, surahNumber);
    setIsDownloaded(downloaded);
    setLoading(false);
    return downloaded;
  }, [reciter, surahNumber]);

  useEffect(() => {
    check();
  }, [check]);

  const redirectIfNotDownloaded = useCallback(async () => {
    const downloaded = await audioService.isAudioDownloaded(reciter, surahNumber);
    if (!downloaded) {
      router.push('/download-audio');
      return false;
    }
    return true;
  }, [reciter, surahNumber, router]);

  return { isDownloaded, loading, check, redirectIfNotDownloaded };
}
