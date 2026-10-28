import { describe, expect, it } from 'vitest';
import { getStartPosition } from '../memorization/getStartPosition';
import { SurahInfo } from '../types';

const mockSurahs: SurahInfo[] = [
  { surahNumber: 1, surahLength: 7 },
  { surahNumber: 2, surahLength: 286 },
  { surahNumber: 114, surahLength: 6 },
];

describe('getStartPosition', () => {
  it('returns 1:0 for ascending direction (Al-Fatiha, before ayah 1)', () => {
    const pos = getStartPosition('asc', mockSurahs);
    expect(pos).toEqual({ surahNumber: 1, ayahNumber: 0 });
  });

  it('returns 114:0 for descending direction (An-Nas, before ayah 1)', () => {
    const pos = getStartPosition('desc', mockSurahs);
    expect(pos).toEqual({ surahNumber: 114, ayahNumber: 0 });
  });
});
