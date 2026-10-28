import { db } from '../client';
import { progressTable } from '../schema';
import { eq } from 'drizzle-orm';
import { MemorizationDailyGoal, MemorizationPosition } from '@/core/types';

export const progressRepository = {
  /**
   * Retrieves the current user progress (always stored with id = 1).
   * Returns null if no progress row has been initialized yet.
   */
  async getProgress() {
    const rows = await db
      .select()
      .from(progressTable)
      .where(eq(progressTable.id, 1))
      .limit(1);

    return rows[0] ?? null;
  },

  /**
   * Retrieves the current memorization position ({ surahNumber, ayahNumber }).
   * Returns null if position is unset (e.g. Hafiz or finished).
   */
  async getMemorizationPosition(): Promise<MemorizationPosition | null> {
    const progress = await this.getProgress();
    if (
      !progress ||
      progress.currentSurah == null ||
      progress.currentAyah == null
    ) {
      return null;
    }
    return {
      surahNumber: progress.currentSurah,
      ayahNumber: progress.currentAyah,
    };
  },

  /**
   * Retrieves the daily memorization goal ({ numberOfNewAyat }).
   */
  async getDailyGoal(): Promise<MemorizationDailyGoal> {
    const progress = await this.getProgress();
    return {
      numberOfNewAyat: progress?.numberOfNewAyat ?? 1,
    };
  },

  /**
   * Updates the progress row.
   */
  async updateProgress(
    data: Partial<Omit<typeof progressTable.$inferInsert, 'id'>>,
  ) {
    await db
      .insert(progressTable)
      .values({
        id: 1,
        currentSurah: 1,
        currentAyah: 0,
        numberOfNewAyat: 1,
        level: 'beginner',
        direction: 'asc',
        userType: 'notHafiz',
        ...data,
      })
      .onConflictDoUpdate({
        target: progressTable.id,
        set: data,
      });
  },

  /**
   * Updates the position to a new surah and ayah (or null if finished/hafiz).
   */
  async updatePosition(surahNumber: number | null, ayahNumber: number | null) {
    return this.updateProgress({
      currentSurah: surahNumber,
      currentAyah: ayahNumber,
    });
  },
};
