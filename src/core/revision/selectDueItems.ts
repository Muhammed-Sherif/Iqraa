import { Direction } from '../types';
import { DueSrsItem } from './types';

/**
 * Filters items that are due (nextDueAt <= now) and sorts them by revision priority:
 * 1. Weak items first (state === 'weak').
 * 2. Overdue items by oldest nextDueAt first.
 * 3. Remaining items in order of the user's direction.
 *
 * Clamps the resulting list to `limit`.
 * Pure function: never mutates the input array.
 *
 * @param items - All candidate SRS items
 * @param now - Current timestamp passed by caller
 * @param limit - Maximum items to select
 * @param direction - User's memorization direction ('asc' | 'desc', default 'asc')
 * @returns Prioritized and limited due items
 */
export function selectDueItems(
  items: DueSrsItem[],
  now: number,
  limit: number,
  direction: Direction = 'asc',
): DueSrsItem[] {
  const dueItems = items.filter((item) => item.nextDueAt <= now);

  const sorted = [...dueItems].sort((a, b) => {
    // 1. Weak state priority
    const aWeak = a.state === 'weak';
    const bWeak = b.state === 'weak';
    if (aWeak && !bWeak) return -1;
    if (!aWeak && bWeak) return 1;

    // 2. Oldest nextDueAt first
    if (a.nextDueAt !== b.nextDueAt) {
      return a.nextDueAt - b.nextDueAt;
    }

    // 3. Directional order: surah order depends on direction, ayat always go forward
    if (a.surahNumber !== b.surahNumber) {
      return direction === 'asc'
        ? a.surahNumber - b.surahNumber
        : b.surahNumber - a.surahNumber;
    }

    return a.ayahNumber - b.ayahNumber;
  });

  return sorted.slice(0, Math.max(0, limit));
}
