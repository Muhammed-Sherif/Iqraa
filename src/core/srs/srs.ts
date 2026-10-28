import { Rate, Srs } from '../types';
import { ladder } from '../../constants/srs';

export function startOfDayAfter(now: number, days: number): number {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
/**
 * Calculates the new review schedule of one ayah after the user rates it.
 * Pure function: it does not change `item` and does not read the clock.
 *
 * @param item - the current SRS state of the ayah
 * @param rate - the user's rating: easy, good, or hard
 * @param now - the current time in milliseconds, passed by the caller
 * @returns a new item with the updated step, next due date, and status
 */
export function scheduleNextReview(item: Srs, rate: Rate, now: number): Srs {
  if (rate === 'easy') {
    const nextStep = Math.min(ladder.length - 1, item.step + 2);
    const nextDueAt = startOfDayAfter(now, ladder[nextStep]);
    return {
      ...item,
      nextDueAt: nextDueAt,
      lastRate: 'easy',
      step: nextStep,
      state: 'active',
    };
  } else if (rate === 'good') {
    const nextStep = Math.min(ladder.length - 1, item.step + 1);
    const nextDueAt = startOfDayAfter(now, ladder[nextStep]);
    return {
      ...item,
      nextDueAt: nextDueAt,
      lastRate: 'good',
      step: nextStep,
      state: 'active',
    };
  } else if (rate === 'hard') {
    const nextStep = 0;
    const nextDueAt = startOfDayAfter(now, ladder[nextStep]);
    return {
      ...item,
      failCount: item.failCount + 1,
      nextDueAt: nextDueAt,
      lastRate: 'hard',
      step: nextStep,
      state: 'weak',
    };
  }
  return item;
}
