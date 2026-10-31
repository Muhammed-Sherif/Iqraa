import { describe, expect, it, test } from 'vitest';
import {
  buildAccumulationSteps,
  transition,
} from '../memorization/sessionEngine';
import { SessionState } from '../types';

describe('buildAccumulationSteps', () => {
  test('creates accumulation steps pairing adjacent ayat and ending with full ayat', () => {
    expect(buildAccumulationSteps([5, 6, 7])).toEqual([
      [5],
      [5, 6],
      [6, 7],
      [7],
      [5, 6, 7],
    ]);
  });

  test('throws error when passed empty ayat array', () => {
    expect(() => buildAccumulationSteps([])).toThrow("can't pass empty steps");
  });
});

type Listening = Extract<SessionState, { type: 'listening' }>;

const steps = buildAccumulationSteps([5, 6, 7]);
const lastStepIndex = steps.length - 1;

function listening(overrides: Partial<Listening> = {}): Listening {
  return {
    taskId: 1,
    type: 'listening',
    steps,
    settings: { repeatCount: 3, sakta: 2 },
    currentStep: 0,
    repeatedCount: 0,
    ...overrides,
  };
}

describe('transition', () => {
  it('reading: finishReading moves to tasmee with no rate', () => {
    const state: SessionState = { taskId: 1, type: 'reading' };
    const result = transition(state, { type: 'finishReading' });
    expect(result).toEqual({ taskId: 1, type: 'tasmee', rate: null });
    expect(state).toEqual({ taskId: 1, type: 'reading' }); // not mutated
  });

  it('listening: repetition below the limit only increases the count', () => {
    const result = transition(listening({ repeatedCount: 1 }), {
      type: 'repetitionFinished',
    });
    expect(result).toEqual(listening({ repeatedCount: 2, currentStep: 0 }));
  });

  it('listening: limit reached with a next step moves on and resets the count', () => {
    const result = transition(listening({ repeatedCount: 2 }), {
      type: 'repetitionFinished',
    });
    expect(result).toEqual(listening({ repeatedCount: 0, currentStep: 1 }));
  });

  it('listening: limit reached on the last step stays on that step', () => {
    const result = transition(
      listening({ currentStep: lastStepIndex, repeatedCount: 2 }),
      {
        type: 'repetitionFinished',
      },
    );
    expect(result).toEqual(
      listening({ currentStep: lastStepIndex, repeatedCount: 3 }),
    );
  });

  it('listening: hard restarts from the first step', () => {
    const result = transition(
      listening({ currentStep: lastStepIndex, repeatedCount: 3 }),
      {
        type: 'listeningRated',
        rate: 'hard',
      },
    );
    expect(result).toEqual(listening({ currentStep: 0, repeatedCount: 0 }));
  });

  it.each(['good', 'easy'] as const)(
    'listening: %s moves to tasmee with no rate',
    (rate) => {
      const result = transition(
        listening({ currentStep: lastStepIndex, repeatedCount: 3 }),
        { type: 'listeningRated', rate },
      );
      expect(result).toEqual({ taskId: 1, type: 'tasmee', rate: null });
    },
  );

  it('tasmee: tasmeeRated saves the new rate', () => {
    const state: SessionState = { taskId: 1, type: 'tasmee', rate: null };
    const result = transition(state, { type: 'tasmeeRated', rate: 'good' });
    expect(result).toEqual({ taskId: 1, type: 'tasmee', rate: 'good' });
    expect(state.rate).toBeNull(); // not mutated
  });

  it('wrong phase: the action is ignored', () => {
    const state: SessionState = { taskId: 1, type: 'reading' };
    const result = transition(state, { type: 'repetitionFinished' });
    expect(result).toBe(state);
  });

  it('listening: rating too early is ignored', () => {
    const state = listening({ currentStep: 0, repeatedCount: 0 });
    const result = transition(state, { type: 'listeningRated', rate: 'good' });
    expect(result).toBe(state);
  });

  it('tasmee: a second rating after finishing is ignored', () => {
    const state: SessionState = { taskId: 1, type: 'tasmee', rate: 'easy' };
    const result = transition(state, { type: 'tasmeeRated', rate: 'hard' });
    expect(result).toBe(state);
  });
});
