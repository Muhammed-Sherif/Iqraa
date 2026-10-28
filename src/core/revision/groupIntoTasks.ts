import { Direction } from '../types';
import { DueSrsItem, TaskDraft } from './types';

/**
 * Groups consecutive due ayat inside the same surah into task drafts.
 * If `maxAyatPerTask` is provided, passages longer than `maxAyatPerTask` are split into separate tasks.
 * Passages with gaps or different surahs are always split into separate tasks.
 *
 * Pure function: never mutates input.
 *
 * @param items - Due SRS items
 * @param direction - User's memorization direction ('asc' | 'desc')
 * @param maxAyatPerTask - Optional maximum ayat per task (if omitted, all consecutive ayat in the same surah stay in one task)
 * @returns Array of TaskDraft objects
 */
export function groupIntoTasks(
  items: DueSrsItem[],
  direction: Direction,
  maxAyatPerTask?: number,
): TaskDraft[] {
  if (items.length === 0) {
    return [];
  }

  // Sort items in recitation order:
  // Surah order depends on direction, ayat inside a surah always advance forward
  const sorted = [...items].sort((a, b) => {
    if (a.surahNumber !== b.surahNumber) {
      return direction === 'asc'
        ? a.surahNumber - b.surahNumber
        : b.surahNumber - a.surahNumber;
    }
    return a.ayahNumber - b.ayahNumber;
  });

  const tasks: TaskDraft[] = [];
  let currentTask: TaskDraft | null = null;

  for (const item of sorted) {
    if (
      currentTask &&
      currentTask.surahNumber === item.surahNumber &&
      item.ayahNumber === currentTask.endAyah + 1 &&
      (!maxAyatPerTask || currentTask.ayatNumbers.length < maxAyatPerTask)
    ) {
      // Consecutive ayah in the same surah within task capacity
      currentTask.ayatNumbers.push(item.ayahNumber);
      currentTask.endAyah = item.ayahNumber;
    } else {
      // Start a new task
      currentTask = {
        surahNumber: item.surahNumber,
        startAyah: item.ayahNumber,
        endAyah: item.ayahNumber,
        ayatNumbers: [item.ayahNumber],
      };
      tasks.push(currentTask);
    }
  }

  return tasks;
}
