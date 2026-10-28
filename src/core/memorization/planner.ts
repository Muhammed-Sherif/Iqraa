import {
  MemorizationPosition,
  MemorizationDailyGoal,
  SurahInfo,
  MemorizationTask,
  MemorizationNextAyat,
  Direction,
} from '../types';

/**
 * Calculates the next memorization position immediately following `end`.
 *
 * Rules:
 * - asc 2:10 -> 2:11 | asc 2:286 -> 3:1 | asc 114:6 -> null
 * - desc 78:10 -> 78:11 | desc 78:40 -> 77:1 | desc 1:7 -> null
 * - Ayat inside a surah always advance forward (1 -> 2 -> ...).
 * - Surah transitions follow direction (asc: +1, desc: -1).
 * - Returns null when the user reaches the end of the Qur'an (114 in asc, 1 in desc).
 * - Throws Error if the surah is not in surahsList or ayahNumber is out of range.
 *
 * @param direction - 'asc' (Al-Fatiha to An-Nas) or 'desc' (An-Nas to Al-Fatiha)
 * @param end - The last ayah { surahNumber, ayahNumber }
 * @param surahsList - List of all surahs with their lengths
 * @returns The next position { surahNumber, ayahNumber } or null if finished
 */
export function calculatePositionAfter(
  direction: Direction,
  end: { surahNumber: number; ayahNumber: number },
  surahsList: SurahInfo[],
): { surahNumber: number; ayahNumber: number } | null {
  const surah = surahsList.find((s) => s.surahNumber === end.surahNumber);
  if (!surah) {
    throw new Error(`Invalid surah number: ${end.surahNumber}`);
  }

  if (end.ayahNumber < 1 || end.ayahNumber > surah.surahLength) {
    throw new Error(
      `Invalid ayah number: ${end.ayahNumber} for surah ${end.surahNumber}`,
    );
  }

  // Inside the same surah, ayat always go forward
  if (end.ayahNumber < surah.surahLength) {
    return {
      surahNumber: end.surahNumber,
      ayahNumber: end.ayahNumber + 1,
    };
  }

  // At the end of the surah: check end of Qur'an
  const isEndOfQuran =
    (direction === 'asc' &&
      end.surahNumber === surahsList[surahsList.length - 1].surahNumber) ||
    (direction === 'desc' && end.surahNumber === surahsList[0].surahNumber);

  if (isEndOfQuran) {
    return null;
  }

  const nextSurahNumber =
    direction === 'asc' ? end.surahNumber + 1 : end.surahNumber - 1;
  const nextSurah = surahsList.find((s) => s.surahNumber === nextSurahNumber);
  if (!nextSurah) {
    return null;
  }

  return {
    surahNumber: nextSurahNumber,
    ayahNumber: 1,
  };
}

function getAyatNumbers(
  currentposition: MemorizationPosition,
  lastAya: lastAya,
): number[] {
  const ayatNumbers: number[] = [];
  const currentAyahNumber = currentposition.ayahNumber;
  if (currentposition.surahNumber === lastAya.surahNumber) {
    const ayatCount = lastAya.ayahNumber - currentAyahNumber;
    for (let index = 0; index < ayatCount; index++) {
      ayatNumbers.push(currentAyahNumber + index + 1);
    }
  } else {
    const ayatCount = lastAya.ayahNumber;
    for (let index = 0; index < ayatCount; index++) {
      ayatNumbers.push(index + 1);
    }
  }
  return ayatNumbers;
}

type getLastAyaStatus =
  | 'inTheSameSurah'
  | 'reachedTheNextSurahFirstTask'
  | 'reachedTheNextSurahSecondTask'
  | 'lastOfQuran';

type lastAya = {
  surahNumber: number;
  ayahNumber: number;
};

function getLastAya(
  currentposition: MemorizationPosition,
  dailyGoal: MemorizationDailyGoal,
  surah: SurahInfo,
  status: getLastAyaStatus,
  direction: Direction,
): lastAya {
  switch (status) {
    case 'inTheSameSurah':
      return {
        surahNumber: currentposition.surahNumber,
        ayahNumber: currentposition.ayahNumber + dailyGoal.numberOfNewAyat,
      };
    case 'reachedTheNextSurahFirstTask':
      return {
        surahNumber: currentposition.surahNumber,
        ayahNumber: surah.surahLength,
      };
    case 'reachedTheNextSurahSecondTask': {
      const nextSurah =
        direction === 'asc'
          ? currentposition.surahNumber + 1
          : currentposition.surahNumber - 1;
      return {
        surahNumber: nextSurah,
        ayahNumber: Math.abs(
          currentposition.ayahNumber +
            dailyGoal.numberOfNewAyat -
            surah.surahLength,
        ),
      };
    }
    case 'lastOfQuran':
      return {
        surahNumber: currentposition.surahNumber,
        ayahNumber: surah.surahLength,
      };
    default:
      throw new Error('unexpected status' + status);
  }
}

function calculateMinimumAyatNumbers(ayatNumbers: number[]): number[] {
  const minimumCount = Math.max(1, Math.ceil(0.25 * ayatNumbers.length));
  return ayatNumbers.slice(0, minimumCount);
}

function calculateNextAyat(
  currentposition: MemorizationPosition,
  dailyGoal: MemorizationDailyGoal,
  surahsList: SurahInfo[],
  direction: Direction,
): MemorizationNextAyat[] | MemorizationNextAyat {
  const surah = surahsList.find(
    (surah) => surah.surahNumber === currentposition.surahNumber,
  );
  if (!surah) throw new Error('envalid surah number');

  const isLastSurah =
    (direction === 'asc' &&
      currentposition.surahNumber ===
        surahsList[surahsList.length - 1].surahNumber) ||
    (direction === 'desc' &&
      currentposition.surahNumber === surahsList[0].surahNumber);

  // If already at the end of the last surah of the Qur'an, nothing left
  if (isLastSurah && currentposition.ayahNumber >= surah.surahLength) {
    return {
      surahNumber: currentposition.surahNumber,
      ayatNumbers: [],
    };
  }

  // In case the number of new ayat exceeds current surah
  if (
    currentposition.ayahNumber + dailyGoal.numberOfNewAyat >
    surah.surahLength
  ) {
    // In case this is the end surah and the number of new ayat exceeds it
    if (isLastSurah) {
      const lastAya = getLastAya(
        currentposition,
        dailyGoal,
        surah,
        'lastOfQuran',
        direction,
      );
      return {
        surahNumber: currentposition.surahNumber,
        ayatNumbers: getAyatNumbers(currentposition, lastAya),
      };
    }

    const lastAyaForFirstTask = getLastAya(
      currentposition,
      dailyGoal,
      surah,
      'reachedTheNextSurahFirstTask',
      direction,
    );
    const firstTaskAyat: MemorizationNextAyat = {
      surahNumber: currentposition.surahNumber,
      ayatNumbers: getAyatNumbers(currentposition, lastAyaForFirstTask),
    };

    const lastAyaForSecondTask = getLastAya(
      currentposition,
      dailyGoal,
      surah,
      'reachedTheNextSurahSecondTask',
      direction,
    );
    const nextSurahNumber =
      direction === 'asc'
        ? currentposition.surahNumber + 1
        : currentposition.surahNumber - 1;

    const secondTaskAyat: MemorizationNextAyat = {
      surahNumber: nextSurahNumber,
      ayatNumbers: getAyatNumbers(currentposition, lastAyaForSecondTask),
    };
    return [firstTaskAyat, secondTaskAyat];
  } else {
    const lastAya = getLastAya(
      currentposition,
      dailyGoal,
      surah,
      'inTheSameSurah',
      direction,
    );
    return {
      surahNumber: currentposition.surahNumber,
      ayatNumbers: getAyatNumbers(currentposition, lastAya),
    };
  }
}

function createNewMemorizationTask({
  ayatNumbers,
  surahNumber,
  minimumAyatNumbers,
  completedCount,
  dueDate,
  status,
  type,
}: Omit<MemorizationTask, 'taskId'>): MemorizationTask {
  const taskId = Math.round(Math.random() * 10000) + new Date().getTime();
  return {
    taskId,
    ayatNumbers,
    surahNumber,
    minimumAyatNumbers,
    completedCount,
    dueDate,
    status,
    type,
  };
}

/**
 * Plans new memorization tasks for today based on the daily goal and current position.
 * Pure function: respects user direction (asc or desc) and returns [] if nothing is left.
 *
 * @param dailyGoal - Daily target for new ayat
 * @param currentposition - Starting position { surahNumber, ayahNumber }
 * @param surahsList - All surahs metadata
 * @param direction - Direction of memorization ('asc' | 'desc', default: 'asc')
 * @returns Array of planned MemorizationTasks for today
 */
export default function planner(
  dailyGoal: MemorizationDailyGoal,
  currentposition: MemorizationPosition,
  surahsList: SurahInfo[],
  direction: Direction = 'asc',
): MemorizationTask[] {
  const nextAyat = calculateNextAyat(
    currentposition,
    dailyGoal,
    surahsList,
    direction,
  );
  if (Array.isArray(nextAyat)) {
    return nextAyat
      .filter((a) => a.ayatNumbers.length > 0)
      .map((a) => {
        return createNewMemorizationTask({
          ayatNumbers: a.ayatNumbers,
          surahNumber: a.surahNumber,
          minimumAyatNumbers: calculateMinimumAyatNumbers(a.ayatNumbers),
          completedCount: 0,
          dueDate: Date.now(),
          status: 'notStarted',
          type: 'new',
        });
      });
  } else {
    return [
      createNewMemorizationTask({
        ayatNumbers: nextAyat.ayatNumbers,
        surahNumber: nextAyat.surahNumber,
        minimumAyatNumbers: calculateMinimumAyatNumbers(nextAyat.ayatNumbers),
        completedCount: 0,
        dueDate: Date.now(),
        status: 'notStarted',
        type: 'new',
      }),
    ].filter((a) => a.ayatNumbers.length > 0);
  }
}
