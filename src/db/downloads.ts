import { db } from './client';
import { downloadsTable } from './schema';
import { and, eq, or, isNull } from 'drizzle-orm';

/**
 * Checks whether audio is downloaded for a specific reciter and optional surah.
 * Returns true if completed, false if not downloaded yet.
 */
export async function isAudioDownloaded(
  reciter: string,
  surahNumber?: number,
): Promise<boolean> {
  try {
    const conditions = [
      eq(downloadsTable.reciter, reciter),
      eq(downloadsTable.status, 'completed'),
    ];

    if (surahNumber !== undefined) {
      // Check either full Quran (surahNumber is null) OR this specific surah
      conditions.push(
        or(
          isNull(downloadsTable.surahNumber),
          eq(downloadsTable.surahNumber, surahNumber),
        )!,
      );
    } else {
      // Full Quran check
      conditions.push(isNull(downloadsTable.surahNumber));
    }

    const rows = await db
      .select({ id: downloadsTable.id })
      .from(downloadsTable)
      .where(and(...conditions))
      .limit(1);

    return rows.length > 0;
  } catch (error) {
    console.error('[isAudioDownloaded] Error checking download status:', error);
    return false;
  }
}

/**
 * Marks audio as downloaded in the downloads table.
 */
export async function markAudioDownloaded(
  reciter: string,
  surahNumber: number | null = null,
  localPath: string = '',
  totalCount: number = 0,
): Promise<void> {
  const now = Date.now();
  await db.insert(downloadsTable).values({
    reciter,
    surahNumber,
    status: 'completed',
    downloadedCount: totalCount,
    totalCount,
    localPath,
    createdAt: now,
    updatedAt: now,
  });
}
