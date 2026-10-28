import { MAX_DAILY_AYAT } from '../../constants/goal';
import { DAILY_MIX_SPLIT, REVISION_DAILY_CEILING } from '../../constants/revision';
import { Level, UserType } from '../types';

export interface DailyMixResult {
  newCount: number;
  revisionCount: number;
}

/**
 * Plans the daily split between new memorization ayat and revision ayat.
 *
 * Rules:
 * - Total capacity is bounded by MAX_DAILY_AYAT[level].
 * - UserType determines split percentage (notHafiz: 70/30, partiallyHafiz: 40/60, hafiz: 10/90).
 * - For hafiz with newMemorizationEnabled = false, newCount is always 0.
 * - Backlog expands revision up to REVISION_DAILY_CEILING[userType].
 * - When revision expands, newCount is reduced down to its minimum (1 for notHafiz/partiallyHafiz, 0 for hafiz).
 *
 * Pure function: never mutates input.
 *
 * @param userType - 'notHafiz' | 'partiallyHafiz' | 'hafiz'
 * @param level - 'beginner' | 'intermediate' | 'advanced' | 'expert'
 * @param backlogCount - Number of currently overdue revision ayat
 * @param newMemorizationEnabled - For hafiz: whether new memorization is enabled (default true)
 * @returns { newCount, revisionCount }
 */
export function planDailyMix(
  userType: UserType,
  level: Level,
  backlogCount: number,
  newMemorizationEnabled: boolean = true,
): DailyMixResult {
  const totalCapacity = MAX_DAILY_AYAT[level];

  if (userType === 'hafiz' && !newMemorizationEnabled) {
    const revisionCeiling = REVISION_DAILY_CEILING[userType];
    const revisionCount = Math.min(
      revisionCeiling,
      Math.max(totalCapacity, backlogCount),
    );
    return {
      newCount: 0,
      revisionCount,
    };
  }

  const split = DAILY_MIX_SPLIT[userType];
  const baseNew = Math.round(totalCapacity * split.newShare);
  const baseRevision = totalCapacity - baseNew;

  const revisionCeiling = REVISION_DAILY_CEILING[userType];
  const revisionCount = Math.min(
    revisionCeiling,
    Math.max(baseRevision, backlogCount),
  );

  let newCount = baseNew;
  if (revisionCount > baseRevision) {
    const excess = revisionCount - baseRevision;
    const minNew = userType === 'hafiz' ? 0 : 1;
    newCount = Math.max(minNew, baseNew - excess);
  }

  return {
    newCount,
    revisionCount,
  };
}
