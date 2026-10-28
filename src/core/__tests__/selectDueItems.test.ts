import { describe, expect, it } from 'vitest';
import { selectDueItems } from '../revision/selectDueItems';
import { DueSrsItem } from '../revision/types';

describe('selectDueItems', () => {
  const now = 100000;

  const weakItem: DueSrsItem = {
    surahNumber: 2,
    ayahNumber: 10,
    step: 0,
    state: 'weak',
    nextDueAt: now - 500,
    failCount: 2,
    source: 'new',
  };

  const overdueOlder: DueSrsItem = {
    surahNumber: 2,
    ayahNumber: 5,
    step: 2,
    state: 'active',
    nextDueAt: now - 2000,
    failCount: 0,
    source: 'new',
  };

  const overdueNewer: DueSrsItem = {
    surahNumber: 2,
    ayahNumber: 15,
    step: 1,
    state: 'active',
    nextDueAt: now - 100,
    failCount: 0,
    source: 'new',
  };

  const notDueYet: DueSrsItem = {
    surahNumber: 1,
    ayahNumber: 1,
    step: 3,
    state: 'active',
    nextDueAt: now + 5000,
    failCount: 0,
    source: 'existing',
  };

  it('filters out items where nextDueAt > now', () => {
    const selected = selectDueItems([notDueYet, overdueNewer], now, 10);
    expect(selected).toHaveLength(1);
    expect(selected[0].ayahNumber).toBe(15);
  });

  it('prioritizes weak items first, then oldest overdue', () => {
    const items = [overdueNewer, weakItem, overdueOlder];
    const selected = selectDueItems(items, now, 10, 'asc');

    // 1st: weakItem
    // 2nd: overdueOlder (nextDueAt: now - 2000)
    // 3rd: overdueNewer (nextDueAt: now - 100)
    expect(selected[0].state).toBe('weak');
    expect(selected[1].ayahNumber).toBe(5);
    expect(selected[2].ayahNumber).toBe(15);
  });

  it('clamps output count to limit', () => {
    const items = [weakItem, overdueOlder, overdueNewer];
    const selected = selectDueItems(items, now, 2);
    expect(selected).toHaveLength(2);
  });
});
