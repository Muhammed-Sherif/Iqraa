import { Direction, MemorizationPosition, SurahInfo } from '../types';

/**
 * Returns the fixed initial memorization position for the user's direction.
 *
 * Rules:
 * - 'asc': 1:0 (Al-Fatiha, before ayah 1)
 * - 'desc': 114:0 (An-Nas, before ayah 1)
 *
 * @param direction - 'asc' | 'desc'
 * @param surahsList - List of all surahs
 * @returns Starting position { surahNumber, ayahNumber }
 */
export function getStartPosition(
  direction: Direction,
  surahsList: SurahInfo[],
): MemorizationPosition {
  if (direction === 'asc') {
    return {
      surahNumber: 1,
      ayahNumber: 0,
    };
  }

  const lastSurahNumber =
    surahsList.length > 0
      ? surahsList[surahsList.length - 1].surahNumber
      : 114;

  return {
    surahNumber: lastSurahNumber,
    ayahNumber: 0,
  };
}
