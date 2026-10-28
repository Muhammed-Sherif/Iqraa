import {
  AyahText,
  ListeningSettings,
  MemorizationTask,
  SessionState,
} from '@/core/types';
import { memorizationService } from '@/services';
import type { AudioPlayer } from 'expo-audio';
import { create } from 'zustand';

const screens = ['listen', 'recall', 'compare', 'evaluate'] as const;
type Screen = (typeof screens)[number];

interface MemorizationState {
  session: SessionState | null;
  setSession: (session: SessionState) => void;
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  goNext: () => void;
  goPrev: () => void;
  task: MemorizationTask | null;
  setTask: (task: MemorizationTask) => void;
  loadTaskAyat: () => Promise<void>;
  setTaskQuranText: (quranText: AyahText[]) => void;
  finishTask: () => void;
  tasks: MemorizationTask[];
  setTasks: (tasks: MemorizationTask[]) => void;
  recordedAudioUri: string | null;
  setRecordedAudioUri: (uri: string | null) => void;
  lastDurationMillis: number;
  setLastDurationMillis: (duration: number) => void;
  settings: ListeningSettings;
  setSettings: (settings: ListeningSettings) => void;
  playerSession: PlayerSession;
  setPlayerSession: (playerSession: Partial<PlayerSession>) => void;
  player: AudioPlayer | null;
  setPlayer: (player: AudioPlayer | null) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  replay: () => void;
  nextAyaOrAdvanceStep: (steps: number[][], onFinished?: () => void) => boolean;
  handleAyaFinished: (
    steps: number[][],
    stepDurationSeconds: number,
    onPlayNext: (nextAyahNumber: number) => void,
    onFinished?: () => void,
  ) => void;
  cancelSakta: () => void;
}
interface PlayerSession {
  currentStep: number;
  currentAyaKey: number;
  isFinished: boolean;
  isInSakta: boolean;
  isTransitioning: boolean;
  saktaDurationSeconds: number;
}
let saktaInterval: ReturnType<typeof setInterval> | null = null;

export const useMemorization = create<MemorizationState>((set, get) => ({
  session: null,

  setSession: (session: SessionState) => set({ session }),

  currentScreen: 'listen',

  setScreen: (currentScreen: Screen) => set({ currentScreen }),

  goNext: () => {
    set((state) => {
      const next = screens.indexOf(state.currentScreen) + 1;
      if (next >= screens.length) return state;
      return { currentScreen: screens[next] };
    });
  },
  goPrev: () => {
    set((state) => {
      const prev = screens.indexOf(state.currentScreen) - 1;
      if (prev < 0) return state;
      return { currentScreen: screens[prev] };
    });
  },
  task: null,
  setTask: (task: MemorizationTask) => {
    set({ task, currentScreen: 'listen', recordedAudioUri: null, lastDurationMillis: 0 });
    if (!task.quranText || task.quranText.length === 0) {
      get().loadTaskAyat();
    }
  },
  loadTaskAyat: async () => {
    const task = get().task;
    if (!task) return;
    try {
      const quranText = await memorizationService.getAyatText(
        task.surahNumber,
        task.ayatNumbers,
      );
      set((state) => {
        if (state.task && state.task.taskId === task.taskId) {
          return {
            task: {
              ...state.task,
              quranText,
            },
          };
        }
        return state;
      });
    } catch (error) {
      console.error('Failed to load ayat for task in store:', error);
    }
  },
  setTaskQuranText: (quranText: AyahText[]) => {
    set((state) => {
      if (!state.task) return state;
      return {
        task: {
          ...state.task,
          quranText,
        },
      };
    });
  },
  finishTask: () => {
    set({ task: null, currentScreen: 'listen', recordedAudioUri: null, lastDurationMillis: 0 });
  },
  tasks: [],
  setTasks: (tasks: MemorizationTask[]) => set({ tasks }),
  recordedAudioUri: null,
  setRecordedAudioUri: (recordedAudioUri: string | null) => set({ recordedAudioUri }),
  lastDurationMillis: 0,
  setLastDurationMillis: (lastDurationMillis: number) => set({ lastDurationMillis }),
  settings: {
    repeatCount: 3,
    sakta: 5,
  },
  setSettings: (settings: ListeningSettings) => {
    set({ settings });
  },
  playerSession: {
    currentStep: 0,
    currentAyaKey: 0,
    isFinished: false,
    isInSakta: false,
    isTransitioning: false,
    saktaDurationSeconds: 0,
  },
  setPlayerSession: (playerSession) => {
    set((state) => ({
      playerSession: {
        ...state.playerSession,
        ...playerSession,
      },
    }));
  },
  player: null,
  setPlayer: (player) => set({ player }),
  play: () => {
    get().player?.play();
  },
  pause: () => {
    get().player?.pause();
  },
  togglePlay: () => {
    const player = get().player;
    if (!player) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  },
  replay: () => {
    const player = get().player;
    if (!player) return;
    player.seekTo(0);
    player.play();
  },
  nextAyaOrAdvanceStep: (steps: number[][], onFinished?: () => void): boolean => {
    let finished = false;
    set((state) => {
      const { currentStep, currentAyaKey } = state.playerSession;
      if (steps && currentStep < steps.length) {
        if (currentAyaKey < steps[currentStep].length - 1) {
          return {
            playerSession: {
              ...state.playerSession,
              currentAyaKey: currentAyaKey + 1,
            },
          };
        } else if (currentStep < steps.length - 1) {
          return {
            playerSession: {
              ...state.playerSession,
              currentAyaKey: 0,
              currentStep: currentStep + 1,
            },
          };
        } else {
          finished = true;
          onFinished?.();
          return {
            playerSession: {
              ...state.playerSession,
              isFinished: true,
            },
          };
        }
      } else {
        finished = true;
        onFinished?.();
        return {
          playerSession: {
            ...state.playerSession,
            isFinished: true,
          },
        };
      }
    });
    return finished;
  },
  cancelSakta: () => {
    if (saktaInterval) {
      clearInterval(saktaInterval);
      saktaInterval = null;
    }
    set((state) => ({
      playerSession: {
        ...state.playerSession,
        isInSakta: false,
        isTransitioning: false,
        saktaDurationSeconds: 0,
      },
    }));
  },
  handleAyaFinished: (
    steps: number[][],
    stepDurationSeconds: number,
    onPlayNext: (nextAyahNumber: number) => void,
    onFinished?: () => void,
  ) => {
    const { playerSession } = get();
    if (playerSession.isTransitioning || playerSession.isFinished) return;
    if (!steps || steps.length === 0) return;

    const { currentStep, currentAyaKey } = playerSession;
    const currentStepAyat = steps[currentStep] ?? [];

    // Check if there are more ayat inside the CURRENT step (children of the step)
    const isStepFinished = currentAyaKey >= currentStepAyat.length - 1;

    if (!isStepFinished) {
      // ── Transition immediately to next ayah within the same step WITHOUT SAKTA ──
      const nextAyaKey = currentAyaKey + 1;
      set((state) => ({
        playerSession: {
          ...state.playerSession,
          currentAyaKey: nextAyaKey,
        },
      }));

      const nextAyahNumber = currentStepAyat[nextAyaKey];
      if (nextAyahNumber !== undefined) {
        onPlayNext(nextAyahNumber);
      }
      return;
    }

    // ── Current step is finished: trigger SAKTA before moving to next step ──
    const isLastStep = currentStep >= steps.length - 1;
    if (isLastStep) {
      set((state) => ({
        playerSession: {
          ...state.playerSession,
          isFinished: true,
          saktaDurationSeconds: 0,
        },
      }));
      onFinished?.();
      return;
    }

    if (saktaInterval) {
      clearInterval(saktaInterval);
      saktaInterval = null;
    }

    // Sakta duration is calculated directly from the total playback time of the step
    const calculatedSaktaSeconds = Math.max(1, Math.round(stepDurationSeconds));
    let remainingSeconds = calculatedSaktaSeconds;

    set((state) => ({
      playerSession: {
        ...state.playerSession,
        isInSakta: true,
        isTransitioning: true,
        saktaDurationSeconds: remainingSeconds,
      },
    }));

    saktaInterval = setInterval(() => {
      remainingSeconds -= 1;
      if (remainingSeconds > 0) {
        set((state) => ({
          playerSession: {
            ...state.playerSession,
            saktaDurationSeconds: remainingSeconds,
          },
        }));
      } else {
        if (saktaInterval) {
          clearInterval(saktaInterval);
          saktaInterval = null;
        }

        const nextStepIndex = currentStep + 1;
        set((state) => ({
          playerSession: {
            ...state.playerSession,
            isInSakta: false,
            currentStep: nextStepIndex,
            currentAyaKey: 0,
            saktaDurationSeconds: 0,
          },
        }));

        const nextAyahNumber = steps[nextStepIndex]?.[0];
        if (nextAyahNumber !== undefined) {
          onPlayNext(nextAyahNumber);
        }

        setTimeout(() => {
          set((state) => ({
            playerSession: {
              ...state.playerSession,
              isTransitioning: false,
            },
          }));
        }, 300);
      }
    }, 1000);
  },
}));

