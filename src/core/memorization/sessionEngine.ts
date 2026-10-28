import {
  Action,
  MemorizationTask,
  SessionState,
  ListeningSettings,
  ListeningSession,
} from '../types';

export function buildAccumulationSteps(ayatNumbers: number[]): number[][] {
  return ayatNumbers.map((_, index) => ayatNumbers.slice(0, index + 1));
}
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
export function isSessionFinished(state: SessionState): boolean {
  return state.type === 'tasmee' && state.rate !== null;
}
export function createReadingSession(taskId: number): SessionState {
  return {
    taskId,
    type: 'reading',
  };
}
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
