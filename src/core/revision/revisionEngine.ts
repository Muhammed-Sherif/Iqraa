import { RevisionAction, RevisionSessionState } from './types';

/**
 * Transitions the revision session to its next state based on the user action.
 *
 * Rules:
 * - Flow: recite -> reveal -> compare -> rateTask -> next task (or weaknessChoice on hard) -> finalRating -> rateSession -> finished.
 * - Actions that do not match the current phase return the same state unchanged.
 * - Repeated ratings of the same task are ignored (idempotent).
 * - Skipping a task records it as skipped without counting as a success.
 * - Pure function: never mutates input.
 *
 * @param state - Current revision session state
 * @param action - Action applied to session
 * @returns Next revision session state
 */
export function revisionTransition(
  state: RevisionSessionState,
  action: RevisionAction,
): RevisionSessionState {
  if (!state) {
    return state;
  }
  const { phase, currentTaskIndex, tasks, evaluations } = state;

  switch (phase) {
    case 'recite': {
      if (action.type === 'reveal') {
        return {
          ...state,
          phase: 'compare',
        };
      }

      if (action.type === 'skipTask') {
        const nextEvaluations = {
          ...evaluations,
          [currentTaskIndex]: {
            taskId: currentTaskIndex,
            rate: 'hard' as const,
            skipped: true,
          },
        };

        const isLastTask = currentTaskIndex + 1 >= tasks.length;
        return {
          ...state,
          phase: isLastTask ? 'finalRating' : 'recite',
          currentTaskIndex: isLastTask
            ? currentTaskIndex
            : currentTaskIndex + 1,
          evaluations: nextEvaluations,
        };
      }

      return state;
    }

    case 'compare':
    case 'rating': {
      if (action.type === 'rateTask') {
        // Prevent duplicate rating if already rated
        if (evaluations[currentTaskIndex]?.rate) {
          return state;
        }

        if (action.rate === 'hard') {
          return {
            ...state,
            phase: 'weaknessChoice',
            evaluations: {
              ...evaluations,
              [currentTaskIndex]: {
                taskId: currentTaskIndex,
                rate: 'hard',
              },
            },
          };
        }

        // Easy or good
        const nextEvaluations = {
          ...evaluations,
          [currentTaskIndex]: {
            taskId: currentTaskIndex,
            rate: action.rate,
          },
        };

        const isLastTask = currentTaskIndex + 1 >= tasks.length;
        return {
          ...state,
          phase: isLastTask ? 'finalRating' : 'recite',
          currentTaskIndex: isLastTask
            ? currentTaskIndex
            : currentTaskIndex + 1,
          evaluations: nextEvaluations,
        };
      }

      if (action.type === 'skipTask') {
        const nextEvaluations = {
          ...evaluations,
          [currentTaskIndex]: {
            taskId: currentTaskIndex,
            rate: 'hard' as const,
            skipped: true,
          },
        };

        const isLastTask = currentTaskIndex + 1 >= tasks.length;
        return {
          ...state,
          phase: isLastTask ? 'finalRating' : 'recite',
          currentTaskIndex: isLastTask
            ? currentTaskIndex
            : currentTaskIndex + 1,
          evaluations: nextEvaluations,
        };
      }

      return state;
    }

    case 'weaknessChoice': {
      if (action.type === 'chooseWeakness') {
        const existing = evaluations[currentTaskIndex] ?? {
          taskId: currentTaskIndex,
          rate: 'hard',
        };

        const nextEvaluations = {
          ...evaluations,
          [currentTaskIndex]: {
            ...existing,
            weakness: action.weakness,
          },
        };

        const isLastTask = currentTaskIndex + 1 >= tasks.length;
        return {
          ...state,
          phase: isLastTask ? 'finalRating' : 'recite',
          currentTaskIndex: isLastTask
            ? currentTaskIndex
            : currentTaskIndex + 1,
          evaluations: nextEvaluations,
        };
      }

      if (action.type === 'back') {
        // Go back to compare to re-rate
        return {
          ...state,
          phase: 'compare',
        };
      }

      return state;
    }

    case 'finalRating': {
      if (action.type === 'rateSession') {
        return {
          ...state,
          phase: 'finished',
          sessionRating: action.rate,
        };
      }

      return state;
    }

    case 'finished':
    default:
      return state;
  }
}

/**
 * Checks whether the revision session has completed.
 *
 * @param state - Current revision session state
 * @returns True if the session phase is 'finished'
 */
export function isRevisionFinished(state: RevisionSessionState): boolean {
  return state.phase === 'finished';
}
