import { describe, expect, it } from 'vitest';
import { planDailyMix } from '../revision/planDailyMix';
import { selectDueItems } from '../revision/selectDueItems';
import { groupIntoTasks } from '../revision/groupIntoTasks';
import {
  revisionTransition,
  isRevisionFinished,
} from '../revision/revisionEngine';
import { scheduleNextReview, startOfDayAfter } from '../srs/srs';
import { adjustDailyGoal } from '../application/adjustDailyGoal';
import { DueSrsItem, RevisionSessionState } from '../revision/types';
import { Rate, Srs } from '../types';

describe('Revision Engine End-to-End Integration Flow', () => {
  const BASE_TIME = 1700000000000; // Fixed timestamp for reproducible tests

  it('orchestrates complete workflow: plan mix -> select items -> group tasks -> review session -> goal adjustment', () => {
    // -------------------------------------------------------------
    // Step 1: Daily Mix Planning
    // -------------------------------------------------------------
    // Intermediate user with 5 overdue items: revision expands to backlog (5), new drops to min (1)
    const mix = planDailyMix('notHafiz', 'intermediate', 5, true);
    expect(mix.newCount).toBe(1);
    expect(mix.revisionCount).toBe(5);

    // -------------------------------------------------------------
    // Step 2: Select Due Items from Pool
    // -------------------------------------------------------------
    const pool: DueSrsItem[] = [
      // Overdue items in Surah 1
      {
        surahNumber: 1,
        ayahNumber: 1,
        step: 0,
        state: 'weak',
        nextDueAt: BASE_TIME - 3600000,
        failCount: 2,
        source: 'new',
      },
      {
        surahNumber: 1,
        ayahNumber: 2,
        step: 0,
        state: 'weak',
        nextDueAt: BASE_TIME - 1800000,
        failCount: 1,
        source: 'new',
      },
      {
        surahNumber: 1,
        ayahNumber: 3,
        step: 1,
        state: 'active',
        nextDueAt: BASE_TIME - 50000,
        failCount: 0,
        source: 'new',
      },
      {
        surahNumber: 1,
        ayahNumber: 4,
        step: 1,
        state: 'active',
        nextDueAt: BASE_TIME - 10000,
        failCount: 0,
        source: 'new',
      },
      // Non-overdue item (should be filtered out)
      {
        surahNumber: 1,
        ayahNumber: 5,
        step: 2,
        state: 'active',
        nextDueAt: BASE_TIME + 86400000,
        failCount: 0,
        source: 'new',
      },
    ];

    const selectedDue = selectDueItems(
      pool,
      BASE_TIME,
      mix.revisionCount,
      'asc',
    );
    expect(selectedDue.length).toBe(4);
    // Highest fail count / lowest step prioritized
    expect(selectedDue[0].ayahNumber).toBe(1);

    // -------------------------------------------------------------
    // Step 3: Group into Revision Tasks (max 5 ayat per task)
    // -------------------------------------------------------------
    const taskDrafts = groupIntoTasks(selectedDue, 'asc', 5);
    expect(taskDrafts.length).toBe(1);
    expect(taskDrafts[0].surahNumber).toBe(1);
    expect(taskDrafts[0].startAyah).toBe(1);
    expect(taskDrafts[0].endAyah).toBe(4);
    expect(taskDrafts[0].ayatNumbers).toEqual([1, 2, 3, 4]);

    // -------------------------------------------------------------
    // Step 4: Active Revision Session State Machine
    // -------------------------------------------------------------
    let state: RevisionSessionState = {
      phase: 'recite',
      tasks: taskDrafts,
      currentTaskIndex: 0,
      evaluations: {},
      sessionRating: null,
    };

    // User reveals verses after reciting from memory
    state = revisionTransition(state, { type: 'reveal' });
    expect(state.phase).toBe('compare');

    // User rates the task as 'hard' (encountered difficulty)
    state = revisionTransition(state, { type: 'rateTask', rate: 'hard' });
    expect(state.phase).toBe('weaknessChoice');
    expect(state.evaluations[0]?.rate).toBe('hard');

    // User pinpoints Ayah 2 as the weak spot
    state = revisionTransition(state, {
      type: 'chooseWeakness',
      weakness: { ayah: 2 },
    });
    // Since task 0 was the only task, we move to finalRating
    expect(state.phase).toBe('finalRating');
    expect(state.evaluations[0]?.weakness).toEqual({ ayah: 2 });

    // User submits overall session rating as 'good'
    state = revisionTransition(state, { type: 'rateSession', rate: 'good' });
    expect(state.phase).toBe('finished');
    expect(state.sessionRating).toBe('good');
    expect(isRevisionFinished(state)).toBe(true);

    // -------------------------------------------------------------
    // Step 5: SRS Rescheduling for Hard Rating
    // -------------------------------------------------------------
    const currentSrs: Srs = {
      step: 1,
      state: 'active',
      nextDueAt: BASE_TIME,
      failCount: 0,
      lastRate: null,
    };
    const nextSrs = scheduleNextReview(currentSrs, 'hard', BASE_TIME);
    expect(nextSrs.step).toBe(0); // Reset to step 0 on failure
    expect(nextSrs.failCount).toBe(1); // Fail count incremented
    expect(nextSrs.state).toBe('weak'); // Tagged as weak
    expect(nextSrs.nextDueAt).toBe(startOfDayAfter(BASE_TIME, 1)); // Due tomorrow

    // -------------------------------------------------------------
    // Step 6: Goal Adjustment
    // -------------------------------------------------------------
    const currentGoal = { numberOfNewAyat: 3 };
    const adjustedGoal = adjustDailyGoal(currentGoal, 'hard', 'intermediate');
    expect(adjustedGoal.numberOfNewAyat).toBe(2); // Reduced by 1 on hard session
  });
});
