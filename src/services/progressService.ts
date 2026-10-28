import { progressRepository } from '@/db/repository';
import { Progress, Level, Direction, UserType } from '@/core/types';

export const progressService = {
  /**
   * Retrieves the current user progress mapped to the core Progress type.
   * Returns null if no progress record exists (e.g. user hasn't completed onboarding).
   */
  async getProgress(): Promise<Progress | null> {
    const row = await progressRepository.getProgress();
    if (!row) {
      return null;
    }

    return {
      currentSurah: row.currentSurah,
      currentAyah: row.currentAyah,
      level: row.level as Level,
      direction: row.direction as Direction,
      userType: row.userType as UserType,
      numberOfNewAyat: row.numberOfNewAyat,
    };
  },

  /**
   * Updates only the daily memorization goal.
   */
  async saveDailyGoal(numberOfNewAyat: number): Promise<void> {
    await progressRepository.updateProgress({ numberOfNewAyat });
  },

  /**
   * Updates the current memorization position.
   */
  async savePosition(surah: number | null, ayah: number | null): Promise<void> {
    await progressRepository.updatePosition(surah, ayah);
  },
};
