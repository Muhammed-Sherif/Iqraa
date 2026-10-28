import { describe, expect, it } from 'vitest';
import { adjustDailyGoal } from '../application/adjustDailyGoal';

describe('adjustDailyGoal', () => {
  it('increases goal by easyStep on "easy" up to max', () => {
    // intermediate: min 1, max 3, easy step 1
    const goal = { numberOfNewAyat: 2 };
    const adjusted = adjustDailyGoal(goal, 'easy', 'intermediate');
    expect(adjusted.numberOfNewAyat).toBe(3);

    // Capped at max (3)
    const atMax = adjustDailyGoal({ numberOfNewAyat: 3 }, 'easy', 'intermediate');
    expect(atMax.numberOfNewAyat).toBe(3);
  });

  it('keeps goal unchanged on "good"', () => {
    const goal = { numberOfNewAyat: 2 };
    const adjusted = adjustDailyGoal(goal, 'good', 'intermediate');
    expect(adjusted.numberOfNewAyat).toBe(2);
  });

  it('decreases goal by hardStep on "hard" down to min', () => {
    // intermediate: min 1, max 3, hard step 1
    const goal = { numberOfNewAyat: 2 };
    const adjusted = adjustDailyGoal(goal, 'hard', 'intermediate');
    expect(adjusted.numberOfNewAyat).toBe(1);

    // Floored at min (1)
    const atMin = adjustDailyGoal({ numberOfNewAyat: 1 }, 'hard', 'intermediate');
    expect(atMin.numberOfNewAyat).toBe(1);
  });

  it('uses expert step sizes (+2 for easy)', () => {
    // expert: min 3, max 10, easy step 2
    const goal = { numberOfNewAyat: 5 };
    const adjusted = adjustDailyGoal(goal, 'easy', 'expert');
    expect(adjusted.numberOfNewAyat).toBe(7);
  });

  it('does not mutate input goal (pure function)', () => {
    const original = { numberOfNewAyat: 2 };
    adjustDailyGoal(original, 'easy', 'intermediate');
    expect(original.numberOfNewAyat).toBe(2);
  });
});
