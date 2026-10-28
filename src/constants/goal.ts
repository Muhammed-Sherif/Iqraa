import { Level } from '@/core/types';

/** Initial daily new ayat target chosen at onboarding per level */
export const INITIAL_DAILY_AYAT: Record<Level, number> = {
  beginner: 1,
  intermediate: 3,
  advanced: 5,
  expert: 10,
};

export const MIN_DAILY_AYAT = {
  beginner: 1,
  intermediate: 1,
  advanced: 2,
  expert: 3,
} as const;

export const MAX_DAILY_AYAT = {
  beginner: 2,
  intermediate: 3,
  advanced: 5,
  expert: 10,
} as const;

export const EASY_STEP = {
  beginner: 1,
  intermediate: 1,
  advanced: 1,
  expert: 2,
} as const;

export const HARD_STEP = {
  beginner: 1,
  intermediate: 1,
  advanced: 1,
  expert: 1,
} as const;
