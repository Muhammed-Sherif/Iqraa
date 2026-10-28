import { describe, expect, it } from 'vitest';
import { planDailyMix } from '../revision/planDailyMix';
import { MAX_DAILY_AYAT } from '../../constants/goal';
import { REVISION_DAILY_CEILING } from '../../constants/revision';

describe('planDailyMix', () => {
  describe('zero backlog default mix', () => {
    it('splits according to UserType percentages', () => {
      // expert MAX_DAILY_AYAT = 10
      const notHafiz = planDailyMix('notHafiz', 'expert', 0);
      expect(notHafiz.newCount).toBe(7); // 70% of 10
      expect(notHafiz.revisionCount).toBe(3); // 30% of 10

      const partiallyHafiz = planDailyMix('partiallyHafiz', 'expert', 0);
      expect(partiallyHafiz.newCount).toBe(4); // 40% of 10
      expect(partiallyHafiz.revisionCount).toBe(6); // 60% of 10

      const hafiz = planDailyMix('hafiz', 'expert', 0);
      expect(hafiz.newCount).toBe(1); // 10% of 10
      expect(hafiz.revisionCount).toBe(9); // 90% of 10
    });

    it('sets newCount to 0 for hafiz when newMemorizationEnabled is false', () => {
      const hafizNoNew = planDailyMix('hafiz', 'expert', 0, false);
      expect(hafizNoNew.newCount).toBe(0);
      expect(hafizNoNew.revisionCount).toBe(MAX_DAILY_AYAT['expert']);
    });
  });

  describe('backlog absorption & ceiling rules', () => {
    it('notHafiz with 25 overdue takes 25 revision without exceeding ceiling of 30', () => {
      const result = planDailyMix('notHafiz', 'expert', 25);
      expect(result.revisionCount).toBe(25);
      // newCount reduced, but floored at minimum 1 for notHafiz
      expect(result.newCount).toBe(1);
    });

    it('notHafiz with 100 overdue is clamped at ceiling (30)', () => {
      const result = planDailyMix('notHafiz', 'expert', 100);
      expect(result.revisionCount).toBe(REVISION_DAILY_CEILING.notHafiz); // 30
      expect(result.newCount).toBe(1);
    });

    it('hafiz with 6,236 due on day one is clamped at ceiling (100)', () => {
      const result = planDailyMix('hafiz', 'expert', 6236);
      expect(result.revisionCount).toBe(REVISION_DAILY_CEILING.hafiz); // 100
      expect(result.newCount).toBe(0); // minimum for hafiz is 0
    });
  });
});
