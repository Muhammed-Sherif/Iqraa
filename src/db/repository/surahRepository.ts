import { db } from '../client';
import { surahsTable } from '../schema';
import { asc, eq } from 'drizzle-orm';
import { SurahInfo } from '@/core/types';

export const surahRepository = {
  /**
   * Retrieves all surahs ordered by surahNumber (1 to 114).
   */
  async getAllSurahs() {
    return db.select().from(surahsTable).orderBy(asc(surahsTable.surahNumber));
  },

  /**
   * Retrieves a single surah by its number.
   */
  async getSurahByNumber(surahNumber: number) {
    const rows = await db
      .select()
      .from(surahsTable)
      .where(eq(surahsTable.surahNumber, surahNumber))
      .limit(1);
    return rows[0] ?? null;
  },

  /**
   * Retrieves all surahs mapped to SurahInfo format ({ surahNumber, surahLength })
   * required by the memorization planner.
   */
  async getSurahListForPlanner(): Promise<SurahInfo[]> {
    const rows = await db
      .select({
        surahNumber: surahsTable.surahNumber,
        surahLength: surahsTable.ayahCount,
      })
      .from(surahsTable)
      .orderBy(asc(surahsTable.surahNumber));

    return rows;
  },
};
