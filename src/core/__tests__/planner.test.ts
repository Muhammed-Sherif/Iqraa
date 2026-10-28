import { describe, expect, it } from 'vitest';
import planner from '../memorization/planner';
import { SurahInfo } from '../types';

const surahsList: SurahInfo[] = [
  { surahNumber: 1, surahLength: 7 },
  { surahNumber: 2, surahLength: 10 },
  { surahNumber: 3, surahLength: 6 },
];

describe('planner (ascending - asc)', () => {
  it('case 0a: starts from the very beginning (1:0) with 1 ayah (Al-Fatiha: 1)', () => {
    const dailyGoal = { numberOfNewAyat: 1 };
    const currentposition = {
      surahNumber: 1,
      ayahNumber: 0,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'asc')).toMatchObject([
      {
        surahNumber: 1,
        ayatNumbers: [1],
        minimumAyatNumbers: [1],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
    ]);
  });

  it('case 0b: starts from the very beginning (1:0) with 3 ayat (Al-Fatiha: 1, 2, 3)', () => {
    const dailyGoal = { numberOfNewAyat: 3 };
    const currentposition = {
      surahNumber: 1,
      ayahNumber: 0,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'asc')).toMatchObject([
      {
        surahNumber: 1,
        ayatNumbers: [1, 2, 3],
        minimumAyatNumbers: [1],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
    ]);
  });

  it('case 1: fits inside the surah', () => {
    const dailyGoal = { numberOfNewAyat: 5 };
    const currentposition = {
      surahNumber: 2,
      ayahNumber: 4,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'asc')).toMatchObject([
      {
        surahNumber: 2,
        ayatNumbers: [5, 6, 7, 8, 9],
        minimumAyatNumbers: [5, 6],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
    ]);
  });

  it('case 2: ends exactly at the end of the surah', () => {
    const dailyGoal = { numberOfNewAyat: 5 };
    const currentposition = {
      surahNumber: 2,
      ayahNumber: 5,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'asc')).toMatchObject([
      {
        surahNumber: 2,
        ayatNumbers: [6, 7, 8, 9, 10],
        minimumAyatNumbers: [6, 7],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
    ]);
  });

  it('case 3: crosses to next surah', () => {
    const dailyGoal = { numberOfNewAyat: 5 };
    const currentposition = {
      surahNumber: 1,
      ayahNumber: 5,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'asc')).toMatchObject([
      {
        surahNumber: 1,
        ayatNumbers: [6, 7],
        minimumAyatNumbers: [6],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
      {
        surahNumber: 2,
        ayatNumbers: [1, 2, 3],
        minimumAyatNumbers: [1],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
    ]);
  });

  it('case 4: starts right at next surah when at end of previous', () => {
    const dailyGoal = { numberOfNewAyat: 3 };
    const currentposition = {
      surahNumber: 1,
      ayahNumber: 7,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'asc')).toMatchObject([
      {
        surahNumber: 2,
        ayatNumbers: [1, 2, 3],
        minimumAyatNumbers: [1],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
    ]);
  });

  it('case 5: reaches end of last surah', () => {
    const dailyGoal = { numberOfNewAyat: 5 };
    const currentposition = {
      surahNumber: 3,
      ayahNumber: 4,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'asc')).toMatchObject([
      {
        surahNumber: 3,
        ayatNumbers: [5, 6],
        minimumAyatNumbers: [5],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
    ]);
  });

  it('case 6: returns empty tasks when Quran is finished in asc', () => {
    const dailyGoal = { numberOfNewAyat: 5 };
    const currentposition = {
      surahNumber: 3,
      ayahNumber: 6,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'asc')).toEqual([]);
  });
});

describe('planner (descending - desc)', () => {
  it('starts from the very beginning in desc (surah 3:0) with 1 ayah', () => {
    const dailyGoal = { numberOfNewAyat: 1 };
    const currentposition = {
      surahNumber: 3,
      ayahNumber: 0,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'desc')).toMatchObject([
      {
        surahNumber: 3,
        ayatNumbers: [1],
        minimumAyatNumbers: [1],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
    ]);
  });

  it('crosses to preceding surah in desc (surah 2 -> surah 1)', () => {
    const dailyGoal = { numberOfNewAyat: 5 };
    const currentposition = {
      surahNumber: 2,
      ayahNumber: 8,
    };

    // Remaining in surah 2: 9, 10 (2 ayat). Next 3 ayat come from surah 1 (1, 2, 3).
    expect(planner(dailyGoal, currentposition, surahsList, 'desc')).toMatchObject([
      {
        surahNumber: 2,
        ayatNumbers: [9, 10],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
      {
        surahNumber: 1,
        ayatNumbers: [1, 2, 3],
        completedCount: 0,
        status: 'notStarted',
        type: 'new',
      },
    ]);
  });

  it('returns empty tasks when Quran is finished in desc (surah 1:7 completed)', () => {
    const dailyGoal = { numberOfNewAyat: 5 };
    const currentposition = {
      surahNumber: 1,
      ayahNumber: 7,
    };

    expect(planner(dailyGoal, currentposition, surahsList, 'desc')).toEqual([]);
  });
});
