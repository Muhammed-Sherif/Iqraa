import { db, withTransaction } from '@/db/client';
import { progressTable } from '@/db/schema';
import { srsRepository, surahRepository } from '@/db/repository';
import { Direction, Level, UserType } from '@/core/types';
import { getStartPosition } from '@/core/memorization/getStartPosition';
import { calculatePositionAfter } from '@/core/memorization/planner';
import { startOfDayAfter } from '@/core/srs/srs';
import { INITIAL_DAILY_AYAT } from '@/constants/goal';

export interface RegisterExistingParams {
  userType: UserType;
  direction: Direction;
  level: Level;
  end?: { surahNumber: number; ayahNumber?: number };
  now?: number;
}

export const onboardingService = {
  /**
   * Registers a user's initial onboarding state in a single SQLite transaction.
   *
   * Rules:
   * - notHafiz: position set to direction start (1:1 or 114:1); no SRS rows registered.
   * - hafiz: all 6,236 ayat registered as existing memorization (state: awaitingAssessment, step: 0); position is null.
   * - partiallyHafiz: all ayat behind `end` in user's direction registered as existing; position is calculatePositionAfter.
   *
   * @param params - Registration parameters
   */
  async registerExistingMemorization({
    userType,
    direction,
    level,
    end,
    now = Date.now(),
  }: RegisterExistingParams): Promise<void> {
    const surahsList = await surahRepository.getSurahListForPlanner();
    const todayStart = startOfDayAfter(now, 0);

    let nextPosition: { surahNumber: number; ayahNumber: number } | null = null;
    const existingAyat: { surahNumber: number; ayahNumber: number }[] = [];

    if (userType === 'notHafiz') {
      nextPosition = getStartPosition(direction, surahsList);
    } else if (userType === 'hafiz') {
      nextPosition = null;
      // All ayat in the Qur'an count as memorized
      for (const surah of surahsList) {
        for (let ayah = 1; ayah <= surah.surahLength; ayah++) {
          existingAyat.push({
            surahNumber: surah.surahNumber,
            ayahNumber: ayah,
          });
        }
      }
    } else if (userType === 'partiallyHafiz') {
      if (!end) {
        throw new Error('End position is required for partiallyHafiz');
      }

      const targetSurah = surahsList.find((s) => s.surahNumber === end.surahNumber);
      if (!targetSurah) {
        throw new Error(`Invalid surah number: ${end.surahNumber}`);
      }

      const endAyah = end.ayahNumber ?? targetSurah.surahLength;
      const endPosition = { surahNumber: end.surahNumber, ayahNumber: endAyah };

      nextPosition = calculatePositionAfter(direction, endPosition, surahsList);

      if (direction === 'asc') {
        for (const surah of surahsList) {
          if (surah.surahNumber < end.surahNumber) {
            for (let a = 1; a <= surah.surahLength; a++) {
              existingAyat.push({
                surahNumber: surah.surahNumber,
                ayahNumber: a,
              });
            }
          } else if (surah.surahNumber === end.surahNumber) {
            for (let a = 1; a <= endAyah; a++) {
              existingAyat.push({
                surahNumber: surah.surahNumber,
                ayahNumber: a,
              });
            }
          }
        }
      } else {
        // desc: An-Nas to Al-Fatiha
        for (const surah of surahsList) {
          if (surah.surahNumber > end.surahNumber) {
            for (let a = 1; a <= surah.surahLength; a++) {
              existingAyat.push({
                surahNumber: surah.surahNumber,
                ayahNumber: a,
              });
            }
          } else if (surah.surahNumber === end.surahNumber) {
            for (let a = 1; a <= endAyah; a++) {
              existingAyat.push({
                surahNumber: surah.surahNumber,
                ayahNumber: a,
              });
            }
          }
        }
      }
    }

    const srsRows = existingAyat.map((item) => ({
      surahNumber: item.surahNumber,
      ayahNumber: item.ayahNumber,
      step: 0,
      state: 'awaitingAssessment' as const,
      nextDueAt: todayStart,
      lastRate: null,
      failCount: 0,
      source: 'existing' as const,
    }));

    // Perform all changes in a single database transaction
    await withTransaction(async () => {
      // 1. Batch insert SRS rows
      if (srsRows.length > 0) {
        await srsRepository.batchInsertItems(srsRows);
      }

      // 2. Set user progress row
      const dailyGoal = INITIAL_DAILY_AYAT[level];
      await db
        .insert(progressTable)
        .values({
          id: 1,
          currentSurah: nextPosition?.surahNumber ?? null,
          currentAyah: nextPosition?.ayahNumber ?? null,
          level,
          direction,
          numberOfNewAyat: dailyGoal,
          userType,
        })
        .onConflictDoUpdate({
          target: progressTable.id,
          set: {
            currentSurah: nextPosition?.surahNumber ?? null,
            currentAyah: nextPosition?.ayahNumber ?? null,
            level,
            direction,
            numberOfNewAyat: dailyGoal,
            userType,
          },
        });
    });
  },

  /**
   * Retrieves all surahs with their numbers, Arabic names, and ayah counts.
   *
   * @returns List of all 114 surahs
   */
  async getAllSurahs() {
    return surahRepository.getAllSurahs();
  },
};
