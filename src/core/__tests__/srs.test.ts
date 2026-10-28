import { describe, expect, it } from 'vitest';
import { scheduleNextReview, startOfDayAfter } from '../srs/srs';
import { Srs } from '../types';

describe('startOfDayAfter', () => {
  it('returns midnight timestamp of future day', () => {
    // 2026-10-25 14:30:00 UTC/local
    const now = new Date(2026, 9, 25, 14, 30, 0).getTime();
    const result = startOfDayAfter(now, 3);
    const expected = new Date(2026, 9, 28, 0, 0, 0, 0).getTime();

    expect(result).toBe(expected);
  });
});

describe('scheduleNextReview', () => {
  const baseItem: Srs = {
    step: 0,
    state: 'awaitingAssessment',
    nextDueAt: 0,
    lastRate: 'good',
    failCount: 0,
  };

  const fixedNow = new Date(2026, 9, 25, 10, 0, 0).getTime();

  it('handles "easy" rating by advancing 2 steps and setting active', () => {
    const updated = scheduleNextReview(baseItem, 'easy', fixedNow);

    expect(updated.step).toBe(2); // 0 + 2 = step 2 (7 days)
    expect(updated.state).toBe('active');
    expect(updated.lastRate).toBe('easy');
    expect(updated.nextDueAt).toBe(startOfDayAfter(fixedNow, 7));
  });

  it('clamps step at maximum ladder index (5) on "easy"', () => {
    const step4Item: Srs = { ...baseItem, step: 4 };
    const updated = scheduleNextReview(step4Item, 'easy', fixedNow);

    expect(updated.step).toBe(5); // 4 + 2 clamped to 5 (60 days)
    expect(updated.nextDueAt).toBe(startOfDayAfter(fixedNow, 60));
  });

  it('handles "good" rating by advancing 1 step', () => {
    const updated = scheduleNextReview(baseItem, 'good', fixedNow);

    expect(updated.step).toBe(1); // 0 + 1 = step 1 (3 days)
    expect(updated.state).toBe('active');
    expect(updated.lastRate).toBe('good');
    expect(updated.nextDueAt).toBe(startOfDayAfter(fixedNow, 3));
  });

  it('clamps step at maximum ladder index on "good"', () => {
    const step5Item: Srs = { ...baseItem, step: 5 };
    const updated = scheduleNextReview(step5Item, 'good', fixedNow);

    expect(updated.step).toBe(5);
  });

  it('handles "hard" rating by resetting to step 0, incrementing failCount, and setting weak', () => {
    const activeItem: Srs = { ...baseItem, step: 3, failCount: 1, state: 'active' };
    const updated = scheduleNextReview(activeItem, 'hard', fixedNow);

    expect(updated.step).toBe(0); // reset to step 0 (1 day)
    expect(updated.state).toBe('weak');
    expect(updated.failCount).toBe(2);
    expect(updated.lastRate).toBe('hard');
    expect(updated.nextDueAt).toBe(startOfDayAfter(fixedNow, 1));
  });

  it('does not mutate the original item (pure function)', () => {
    const original: Srs = { ...baseItem };
    scheduleNextReview(original, 'easy', fixedNow);

    expect(original.step).toBe(0);
    expect(original.state).toBe('awaitingAssessment');
  });
});
