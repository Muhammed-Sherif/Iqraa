import { db } from '../client';
import { ayatTable } from '../schema';
import { and, asc, eq, gte, inArray, lte } from 'drizzle-orm';

export const ayahRepository = {
  /**
   * Retrieves all ayat for a given surah.
   */
  async getAyatBySurah(surahNumber: number) {
    return db
      .select()
      .from(ayatTable)
      .where(eq(ayatTable.surahNumber, surahNumber))
      .orderBy(asc(ayatTable.ayahNumber));
  },

  /**
   * Retrieves specific ayat by numbers within a surah.
   */
  async getAyatByNumbers(surahNumber: number, ayahNumbers: number[]) {
    if (ayahNumbers.length === 0) return [];
    return db
      .select()
      .from(ayatTable)
      .where(
        and(
          eq(ayatTable.surahNumber, surahNumber),
          inArray(ayatTable.ayahNumber, ayahNumbers),
        ),
      )
      .orderBy(asc(ayatTable.ayahNumber));
  },

  /**
   * Retrieves a specific single ayah.
   */
  async getAyah(surahNumber: number, ayahNumber: number) {
    const rows = await db
      .select()
      .from(ayatTable)
      .where(
        and(
          eq(ayatTable.surahNumber, surahNumber),
          eq(ayatTable.ayahNumber, ayahNumber),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  },

  /**
   * Retrieves a range of ayat within a surah.
   */
  async getAyatRange(surahNumber: number, startAyah: number, endAyah: number) {
    return db
      .select()
      .from(ayatTable)
      .where(
        and(
          eq(ayatTable.surahNumber, surahNumber),
          gte(ayatTable.ayahNumber, startAyah),
          lte(ayatTable.ayahNumber, endAyah),
        ),
      )
      .orderBy(asc(ayatTable.ayahNumber));
  },
};
