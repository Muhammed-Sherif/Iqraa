import { db } from '@/db/client';
import { surahsTable } from '@/db/schema';
import { seedQuran } from '@/db/seed';
import { count } from 'drizzle-orm';

/**
 * Service to manage initial seeding of the Holy Quran text and metadata into local SQLite.
 * Adheres to layer separation: Screen / UI -> Hook -> Service -> DB Repository -> SQLite.
 */
export const quranSeedService = {
  /**
   * Checks whether the Quran data has already been seeded into the database.
   *
   * @returns {Promise<boolean>} True if all 114 surahs exist in SQLite, false otherwise.
   */
  async isSeeded(): Promise<boolean> {
    const result = await db.select({ value: count() }).from(surahsTable);
    const surahCount = result[0]?.value ?? 0;
    return surahCount >= 114;
  },

  /**
   * Executes the initial seed of Quran surahs and ayat into SQLite.
   *
   * @returns {Promise<void>} Resolves when seeding completes.
   */
  async seed(): Promise<void> {
    await seedQuran();
  },
};
