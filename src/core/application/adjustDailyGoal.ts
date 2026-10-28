import {
  EASY_STEP,
  HARD_STEP,
  MAX_DAILY_AYAT,
  MIN_DAILY_AYAT,
} from '../../constants/goal';
import { Level, MemorizationDailyGoal, Rate } from '../types';
import { clamp } from '../utils';

/**
 * Adjusts the daily memorization goal based on the user's session rating.
 *
 * - 'easy': Increases daily ayat by the level's easy step (capped at MAX_DAILY_AYAT).
 * - 'good': Leaves the goal unchanged.
 * - 'hard': Decreases daily ayat by the level's hard step (floored at MIN_DAILY_AYAT).
 *
 * Pure function: never mutates input, returns a new goal object.
 *
 * @param goal - Current daily memorization goal
 * @param rate - Rating given ('easy' | 'good' | 'hard')
 * @param level - User's current memorization level
 * @returns New MemorizationDailyGoal with clamped numberOfNewAyat
 */
export function adjustDailyGoal(
  goal: MemorizationDailyGoal,
  rate: Rate,
  level: Level,
): MemorizationDailyGoal {
  const max = MAX_DAILY_AYAT[level];
  const min = MIN_DAILY_AYAT[level];
  const easyStep = EASY_STEP[level];
  const hardStep = HARD_STEP[level];

  switch (rate) {
    case 'easy':
      return {
        ...goal,
        numberOfNewAyat: clamp(goal.numberOfNewAyat + easyStep, min, max),
      };
    case 'good':
      return goal;
    case 'hard':
      return {
        ...goal,
        numberOfNewAyat: clamp(goal.numberOfNewAyat - hardStep, min, max),
      };
  }
}
