import { describe, expect, it } from 'vitest';
import { groupIntoTasks } from '../revision/groupIntoTasks';
import { DueSrsItem } from '../revision/types';

function makeItem(surahNumber: number, ayahNumber: number): DueSrsItem {
  return {
    surahNumber,
    ayahNumber,
    step: 1,
    state: 'active',
    nextDueAt: 0,
    failCount: 0,
    source: 'existing',
  };
}

describe('groupIntoTasks', () => {
  it('groups all consecutive ayat in the same surah into a single task by default', () => {
    // 13 consecutive ayat (1 to 13) in surah 2
    const items = Array.from({ length: 13 }, (_, i) => makeItem(2, i + 1));
    const tasks = groupIntoTasks(items, 'asc');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].surahNumber).toBe(2);
    expect(tasks[0].startAyah).toBe(1);
    expect(tasks[0].endAyah).toBe(13);
    expect(tasks[0].ayatNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it('groups consecutive ayat in the same surah up to maxAyatPerTask when specified', () => {
    // 7 consecutive ayat (1 to 7) in surah 2
    const items = [1, 2, 3, 4, 5, 6, 7].map((num) => makeItem(2, num));
    const tasks = groupIntoTasks(items, 'asc', 5);

    // Split into 2 tasks: [1..5] (5 ayat) and [6..7] (2 ayat)
    expect(tasks).toHaveLength(2);
    expect(tasks[0].surahNumber).toBe(2);
    expect(tasks[0].ayatNumbers).toEqual([1, 2, 3, 4, 5]);
    expect(tasks[0].startAyah).toBe(1);
    expect(tasks[0].endAyah).toBe(5);

    expect(tasks[1].surahNumber).toBe(2);
    expect(tasks[1].ayatNumbers).toEqual([6, 7]);
    expect(tasks[1].startAyah).toBe(6);
    expect(tasks[1].endAyah).toBe(7);
  });

  it('starts a new task when surah changes', () => {
    const items = [
      makeItem(1, 7),
      makeItem(2, 1),
      makeItem(2, 2),
    ];
    const tasks = groupIntoTasks(items, 'asc', 5);

    expect(tasks).toHaveLength(2);
    expect(tasks[0].surahNumber).toBe(1);
    expect(tasks[0].ayatNumbers).toEqual([7]);

    expect(tasks[1].surahNumber).toBe(2);
    expect(tasks[1].ayatNumbers).toEqual([1, 2]);
  });

  it('starts a new task for non-consecutive ayat in the same surah', () => {
    const items = [
      makeItem(2, 10),
      makeItem(2, 15), // gap between 10 and 15
    ];
    const tasks = groupIntoTasks(items, 'asc', 5);

    expect(tasks).toHaveLength(2);
    expect(tasks[0].ayatNumbers).toEqual([10]);
    expect(tasks[1].ayatNumbers).toEqual([15]);
  });
});
