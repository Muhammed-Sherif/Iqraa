type Status = 'notStarted' | 'inProgress' | 'completed';
export type Rate = 'easy' | 'good' | 'hard';
export type Direction = 'asc' | 'desc';
export type UserType = 'notHafiz' | 'partiallyHafiz' | 'hafiz';

export interface AyahText {
  num: number;
  text: string;
}

export interface MemorizationTask {
  taskId: number;
  ayatNumbers: number[];
  surahNumber: number;
  minimumAyatNumbers: number[];
  completedCount: number;
  dueDate: number;
  status: Status;
  type: 'new' | 'reinforcement';
  quranText?: AyahText[];
}

export interface SurahInfo {
  surahNumber: number;
  surahLength: number;
}

export interface MemorizationPosition {
  surahNumber: number;
  ayahNumber: number;
}

export interface MemorizationNextAyat {
  surahNumber: number;
  ayatNumbers: number[];
}

export interface MemorizationDailyGoal {
  numberOfNewAyat: number;
}

export interface ReadingSession {
  type: 'reading';
}

export interface ListeningSettings {
  repeatCount: number;
  sakta: number;
}

export interface ListeningSession {
  type: 'listening';
  steps: number[][];
  settings: ListeningSettings;
  currentStep: number;
  repeatedCount: number;
}

export interface TasmeeSession {
  type: 'tasmee';
  rate: Rate | null;
}

export type SessionState =
  | (ReadingSession & { taskId: number })
  | (ListeningSession & { taskId: number })
  | (TasmeeSession & { taskId: number });

export type Action =
  | { type: 'finishReading' }
  | { type: 'repetitionFinished' }
  | { type: 'listeningRated'; rate: Rate }
  | { type: 'tasmeeRated'; rate: Rate };

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Core domain type returned by progressService. Never contains Drizzle types. */
export interface Progress {
  currentSurah: number | null;
  currentAyah: number | null;
  level: Level;
  direction: Direction;
  userType: UserType;
  numberOfNewAyat: number;
}

export type SrsState = 'awaitingAssessment' | 'active' | 'weak';

export interface Srs {
  step: number;
  state: SrsState;
  nextDueAt: number;
  lastRate: Rate | null;
  failCount: number;
}

export type ReviewEventKind =
  | 'tasmee'
  | 'revision'
  | 'practice'
  | 'sessionFinal';

export interface ReviewEvent {
  id?: number;
  surahNumber?: number | null;
  ayahNumber?: number | null;
  kind: ReviewEventKind;
  rate: Rate;
  taskId?: number | null;
  createdAt: number;
}

export type RevisionTaskType = 'scheduled' | 'initialAssessment' | 'focused';
export type RevisionTaskStatus =
  | 'pending'
  | 'inProgress'
  | 'completed'
  | 'skipped';

export interface RevisionTask {
  id?: number;
  planDate: number;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  type: RevisionTaskType;
  status: RevisionTaskStatus;
  rate?: Rate | null;
  completedAt?: number | null;
}
