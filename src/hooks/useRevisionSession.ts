import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { revisionService, HardHandoffData } from '@/services';
import { MemorizationTask, Rate, RevisionTask } from '@/core/types';
import {
  RevisionAction,
  RevisionPhase,
  RevisionSessionState,
  WeaknessChoice,
} from '@/core/revision/types';
import {
  isRevisionFinished,
  revisionTransition,
} from '@/core/revision/revisionEngine';

export interface UseRevisionSessionResult {
  sessionState: RevisionSessionState | null;
  currentTask: RevisionTask | null;
  phase: RevisionPhase | null;
  isFinished: boolean;
  hardHandoff: HardHandoffData | null;
  loading: boolean;
  error: Error | null;
  reveal: () => void;
  rateTask: (rate: Rate) => Promise<void>;
  chooseWeakness: (
    weakness: WeaknessChoice,
    launchReinforcement?: boolean,
  ) => Promise<MemorizationTask | null>;
  skipTask: () => void;
  rateSession: (rate: Rate) => Promise<void>;
  backToCompare: () => void;
  refresh: () => Promise<void>;
}

function buildInitialState(tasks: RevisionTask[]): RevisionSessionState {
  const drafts = tasks.map((t) => {
    const ayatNumbers: number[] = [];
    for (let a = t.startAyah; a <= t.endAyah; a++) {
      ayatNumbers.push(a);
    }
    return {
      surahNumber: t.surahNumber,
      startAyah: t.startAyah,
      endAyah: t.endAyah,
      ayatNumbers,
    };
  });

  const evaluations: RevisionSessionState['evaluations'] = {};
  let firstPendingIndex = -1;

  tasks.forEach((t, index) => {
    if (t.status === 'completed' && t.rate) {
      evaluations[index] = {
        taskId: index,
        rate: t.rate,
      };
    } else if (firstPendingIndex === -1 && t.status === 'pending') {
      firstPendingIndex = index;
    }
  });

  const allCompleted = tasks.length > 0 && firstPendingIndex === -1;
  const currentTaskIndex = allCompleted ? 0 : Math.max(0, firstPendingIndex);
  const phase: RevisionPhase = allCompleted
    ? 'finalRating'
    : tasks.length === 0
      ? 'finished'
      : 'recite';

  return {
    phase,
    tasks: drafts,
    currentTaskIndex,
    evaluations,
    sessionRating: null,
  };
}

/**
 * Hook to drive an interactive revision session.
 * Manages task progression, phase transitions, rating submissions, and reinforcement handoffs.
 *
 * @returns {UseRevisionSessionResult} Session state, controls, and active task
 */
export function useRevisionSession(): UseRevisionSessionResult {
  const [tasks, setTasks] = useState<RevisionTask[]>([]);
  const [sessionState, setSessionState] = useState<RevisionSessionState | null>(
    null,
  );
  const [hardHandoff, setHardHandoff] = useState<HardHandoffData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const hasLoadedRef = useRef<boolean>(false);
  const fetchSeqRef = useRef<number>(0);

  const dispatch = useCallback(
    (action: RevisionAction) => {
      setSessionState((prev) => {
        const base =
          prev ?? (tasks.length > 0 ? buildInitialState(tasks) : null);
        return base ? revisionTransition(base, action) : null;
      });
    },
    [tasks],
  );

  const loadSession = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    try {
      const todayTasks = await revisionService.getTodayRevisionTasks();
      if (seq === fetchSeqRef.current) {
        setTasks(todayTasks);
        setSessionState(buildInitialState(todayTasks));
        setLoading(false);
        setError(null);
        hasLoadedRef.current = true;
      }
    } catch (err) {
      if (seq === fetchSeqRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
        hasLoadedRef.current = true;
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const seq = ++fetchSeqRef.current;

      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      revisionService
        .getTodayRevisionTasks()
        .then((todayTasks) => {
          if (isActive && seq === fetchSeqRef.current) {
            setTasks(todayTasks);
            setSessionState((prev) =>
              prev ??
              (todayTasks.length > 0 ? buildInitialState(todayTasks) : null),
            );
            setError(null);
          }
        })
        .catch((err) => {
          if (isActive && seq === fetchSeqRef.current) {
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        })
        .finally(() => {
          if (isActive && seq === fetchSeqRef.current) {
            hasLoadedRef.current = true;
            setLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  // Derive active session state
  const activeState =
    sessionState ?? (tasks.length > 0 ? buildInitialState(tasks) : null);

  const currentTask: RevisionTask | null =
    activeState && tasks[activeState.currentTaskIndex]
      ? tasks[activeState.currentTaskIndex]
      : null;

  const reveal = useCallback(() => {
    dispatch({ type: 'reveal' });
  }, []);

  const rateTask = useCallback(
    async (rate: Rate) => {
      if (!currentTask || currentTask.id == null) return;

      try {
        const handoff = await revisionService.submitTaskRating(
          currentTask.id,
          rate,
        );
        if (handoff) {
          setHardHandoff(handoff);
        }
        dispatch({ type: 'rateTask', rate });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [currentTask],
  );

  const chooseWeakness = useCallback(
    async (
      weakness: WeaknessChoice,
      launchReinforcement: boolean = false,
    ): Promise<MemorizationTask | null> => {
      if (!currentTask || currentTask.id == null) return null;

      try {
        let reinforcementTask: MemorizationTask | null = null;
        if (launchReinforcement) {
          reinforcementTask = await revisionService.startFocusedMemorization(
            currentTask.id,
            weakness,
          );
        }
        dispatch({ type: 'chooseWeakness', weakness });
        setHardHandoff(null);
        return reinforcementTask;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    },
    [currentTask],
  );

  const skipTask = useCallback(() => {
    dispatch({ type: 'skipTask' });
  }, []);

  const rateSession = useCallback(async (rate: Rate) => {
    try {
      await revisionService.finishRevisionSession(rate);
      dispatch({ type: 'rateSession', rate });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  const backToCompare = useCallback(() => {
    dispatch({ type: 'back' });
  }, []);

  return {
    sessionState: activeState,
    currentTask,
    phase: activeState?.phase ?? null,
    isFinished: activeState ? isRevisionFinished(activeState) : false,
    hardHandoff,
    loading,
    error,
    reveal,
    rateTask,
    chooseWeakness,
    skipTask,
    rateSession,
    backToCompare,
    refresh: loadSession,
  };
}
