import { describe, expect, it } from 'vitest';
import { isRevisionFinished, revisionTransition } from '../revision/revisionEngine';
import { RevisionSessionState, TaskDraft } from '../revision/types';

describe('revisionEngine', () => {
  const task1: TaskDraft = {
    surahNumber: 2,
    startAyah: 1,
    endAyah: 5,
    ayatNumbers: [1, 2, 3, 4, 5],
  };

  const task2: TaskDraft = {
    surahNumber: 2,
    startAyah: 6,
    endAyah: 10,
    ayatNumbers: [6, 7, 8, 9, 10],
  };

  const initialSession: RevisionSessionState = {
    phase: 'recite',
    tasks: [task1, task2],
    currentTaskIndex: 0,
    evaluations: {},
    sessionRating: null,
  };

  it('progresses: recite -> reveal -> compare', () => {
    const s1 = revisionTransition(initialSession, { type: 'reveal' });
    expect(s1.phase).toBe('compare');
  });

  it('rating easy/good on non-final task advances to next task at recite phase', () => {
    const s1 = revisionTransition(initialSession, { type: 'reveal' });
    const s2 = revisionTransition(s1, { type: 'rateTask', rate: 'good' });

    expect(s2.phase).toBe('recite');
    expect(s2.currentTaskIndex).toBe(1);
    expect(s2.evaluations[0]).toMatchObject({ rate: 'good' });
  });

  it('rating hard enters weaknessChoice phase', () => {
    const s1 = revisionTransition(initialSession, { type: 'reveal' });
    const s2 = revisionTransition(s1, { type: 'rateTask', rate: 'hard' });

    expect(s2.phase).toBe('weaknessChoice');
    expect(s2.evaluations[0]?.rate).toBe('hard');
  });

  it('choosing weakness advances to next task', () => {
    const s1 = revisionTransition(initialSession, { type: 'reveal' });
    const s2 = revisionTransition(s1, { type: 'rateTask', rate: 'hard' });
    const s3 = revisionTransition(s2, {
      type: 'chooseWeakness',
      weakness: { ayah: 3 },
    });

    expect(s3.phase).toBe('recite');
    expect(s3.currentTaskIndex).toBe(1);
    expect(s3.evaluations[0]?.weakness).toEqual({ ayah: 3 });
  });

  it('allows back from weaknessChoice to return to compare phase', () => {
    const s1 = revisionTransition(initialSession, { type: 'reveal' });
    const s2 = revisionTransition(s1, { type: 'rateTask', rate: 'hard' });
    const s3 = revisionTransition(s2, { type: 'back' });

    expect(s3.phase).toBe('compare');
  });

  it('skipping task records skipped evaluation and advances', () => {
    const s1 = revisionTransition(initialSession, { type: 'skipTask' });

    expect(s1.phase).toBe('recite');
    expect(s1.currentTaskIndex).toBe(1);
    expect(s1.evaluations[0]?.skipped).toBe(true);
  });

  it('completing all tasks moves to finalRating phase, then finished after session rating', () => {
    // Single-task session
    const singleTaskSession: RevisionSessionState = {
      ...initialSession,
      tasks: [task1],
    };

    const s1 = revisionTransition(singleTaskSession, { type: 'reveal' });
    const s2 = revisionTransition(s1, { type: 'rateTask', rate: 'good' });
    expect(s2.phase).toBe('finalRating');
    expect(isRevisionFinished(s2)).toBe(false);

    const s3 = revisionTransition(s2, { type: 'rateSession', rate: 'easy' });
    expect(s3.phase).toBe('finished');
    expect(s3.sessionRating).toBe('easy');
    expect(isRevisionFinished(s3)).toBe(true);
  });

  it('ignores invalid actions for current phase (pure and idempotent)', () => {
    // Calling rateSession while in recite phase is ignored
    const same = revisionTransition(initialSession, {
      type: 'rateSession',
      rate: 'good',
    });
    expect(same).toBe(initialSession);
  });
});
