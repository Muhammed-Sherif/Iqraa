import {
  Action,
  MemorizationTask,
  SessionState,
  ListeningSettings,
  ListeningSession,
} from '../types';

/**
 * Builds sequential accumulation steps for listening and memorization.
 * Creates incremental steps pairing adjacent ayat and concludes with all ayat combined.
 *
 * @param ayatNumbers - Array of ayah numbers in the memorization task
 * @returns Array of step arrays containing ayah numbers for each step
 * @throws Error if ayatNumbers is empty
 */
export function buildAccumulationSteps(ayatNumbers: number[]): number[][] {
  if (ayatNumbers.length === 0) throw Error("can't pass empty steps");
  return [
    [ayatNumbers[0]],
    ...ayatNumbers.map((_, index) => ayatNumbers.slice(index, index + 2)),
    ayatNumbers.flat(),
  ];
}

/**
 * Handles evaluation feedback after completing the listening phase.
 * If rated 'hard', restarts the listening session from the beginning.
 * If rated 'good' or 'easy', advances to the tasmee (recitation) phase.
 *
 * @param action - Action containing the rating ('hard' | 'good' | 'easy')
 * @param state - Current listening session state
 * @returns New updated session state
 */
function handleFeedBack(action: Action, state: SessionState): SessionState {
  if (state.type === 'listening') {
    if (action.type === 'listeningRated') {
      if (action.rate === 'hard') {
        return {
          ...state,
          currentStep: 0,
          repeatedCount: 0,
        };
      } else {
        return {
          taskId: state.taskId,
          type: 'tasmee',
          rate: null,
        };
      }
    }
  }
  return state;
}

/**
 * Pure state transition function that computes the next session state given an action.
 *
 * Handles transitions for:
 * - 'reading': Moves to tasmee upon 'finishReading'
 * - 'listening': Increments repetition count or advances to the next step, and transitions upon rating
 * - 'tasmee': Records the final recitation rating upon 'tasmeeRated'
 *
 * @param state - Current session state (reading, listening, or tasmee)
 * @param action - Dispatched session action
 * @returns Next session state, or the identical state reference if the action is invalid for the phase
 */
export function transition(state: SessionState, action: Action): SessionState {
  switch (state.type) {
    case 'reading':
      switch (action.type) {
        case 'finishReading':
          return {
            taskId: state.taskId,
            rate: null,
            type: 'tasmee',
          };
        default:
          return state; // rule 8
      }

    case 'listening':
      switch (action.type) {
        case 'repetitionFinished':
          const nextRepeatedCount = state.repeatedCount + 1;
          if (nextRepeatedCount >= state.settings.repeatCount) {
            if (state.currentStep + 1 < state.steps.length) {
              return {
                ...state,
                repeatedCount: 0,
                currentStep: state.currentStep + 1,
              };
            } else {
              return {
                ...state,
                repeatedCount: nextRepeatedCount,
              };
            }
          }
          return { ...state, repeatedCount: nextRepeatedCount };
        case 'listeningRated':
          const isLastStep = state.currentStep === state.steps.length - 1;
          const isDone = state.repeatedCount >= state.settings.repeatCount;
          if (!isLastStep || !isDone) return state; // التقييم بدري، اتجاهله
          return handleFeedBack(action, state);
        default:
          return state; // rule 8
      }

    case 'tasmee':
      switch (action.type) {
        case 'tasmeeRated':
          if (state.rate !== null) return state; // الجلسة خلصت، تجاهل
          return {
            taskId: state.taskId,
            type: 'tasmee',
            rate: action.rate,
          };
        default:
          return state; // rule 8
      }
  }
}

/**
 * Checks whether the memorization session has completed all phases and been evaluated.
 *
 * @param state - Current session state
 * @returns True if in tasmee phase and has received a non-null rating
 */
export function isSessionFinished(state: SessionState): boolean {
  return state.type === 'tasmee' && state.rate !== null;
}

/**
 * Creates an initial reading session state for a given task.
 *
 * @param taskId - ID of the memorization task
 * @returns Fresh reading session state
 */
export function createReadingSession(taskId: number): SessionState {
  return {
    taskId,
    type: 'reading',
  };
}

/**
 * Creates an initial listening session state with accumulation steps computed.
 *
 * @param task - Memorization task containing ayat numbers and metadata
 * @param settings - Listening settings (repeatCount, sakta duration)
 * @returns Fresh listening session state populated with generated steps
 * @throws Error if task has no ayat numbers
 */
export function createListeningSession(
  task: MemorizationTask,
  settings: ListeningSettings,
): ListeningSession & { taskId: number } {
  const steps = buildAccumulationSteps(task.ayatNumbers);
  if (steps.length < 0) throw Error("can't pass empty steps");
  return {
    taskId: task.taskId,
    type: 'listening',
    settings: settings,
    currentStep: 0,
    repeatedCount: 0,
    steps: steps,
  };
}
