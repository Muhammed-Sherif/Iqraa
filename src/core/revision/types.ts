import { Rate, SrsState } from '../types';

export type WeaknessChoice =
  | 'wholePassage'
  | { ayah: number }
  | 'unknown';

export interface DueSrsItem {
  surahNumber: number;
  ayahNumber: number;
  step: number;
  state: SrsState;
  nextDueAt: number;
  lastRate?: Rate | null;
  failCount: number;
  source: 'new' | 'existing';
}

export interface TaskDraft {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  ayatNumbers: number[];
}

export type RevisionPhase =
  | 'recite'
  | 'compare'
  | 'rating'
  | 'weaknessChoice'
  | 'finalRating'
  | 'finished';

export interface TaskEvaluation {
  taskId: number;
  rate: Rate;
  weakness?: WeaknessChoice;
  skipped?: boolean;
}

export interface RevisionSessionState {
  phase: RevisionPhase;
  tasks: TaskDraft[];
  currentTaskIndex: number;
  evaluations: Record<number, TaskEvaluation>;
  sessionRating: Rate | null;
}

export type RevisionAction =
  | { type: 'reveal' }
  | { type: 'rateTask'; rate: Rate }
  | { type: 'chooseWeakness'; weakness: WeaknessChoice }
  | { type: 'back' }
  | { type: 'skipTask' }
  | { type: 'rateSession'; rate: Rate };
