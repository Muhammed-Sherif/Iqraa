import { describe, expect, it } from 'vitest';
import { calculatePositionAfter } from '../memorization/planner';
import { SurahInfo } from '../types';

const mockSurahs: SurahInfo[] = [
  { surahNumber: 1, surahLength: 7 },
  { surahNumber: 2, surahLength: 286 },
  { surahNumber: 3, surahLength: 200 },
  { surahNumber: 77, surahLength: 50 },
  { surahNumber: 78, surahLength: 40 },
  { surahNumber: 114, surahLength: 6 },
];

describe('calculatePositionAfter', () => {
  describe('ascending (asc)', () => {
    it('advances ayah inside the same surah (asc 2:10 -> 2:11)', () => {
      const next = calculatePositionAfter('asc', { surahNumber: 2, ayahNumber: 10 }, mockSurahs);
      expect(next).toEqual({ surahNumber: 2, ayahNumber: 11 });
    });

    it('moves to the first ayah of the next surah at surah end (asc 2:286 -> 3:1)', () => {
      const next = calculatePositionAfter('asc', { surahNumber: 2, ayahNumber: 286 }, mockSurahs);
      expect(next).toEqual({ surahNumber: 3, ayahNumber: 1 });
    });

    it('returns null at the end of the Quran (asc 114:6 -> null)', () => {
      const next = calculatePositionAfter('asc', { surahNumber: 114, ayahNumber: 6 }, mockSurahs);
      expect(next).toBeNull();
    });
  });

  describe('descending (desc)', () => {
    it('advances ayah forward inside the same surah (desc 78:10 -> 78:11)', () => {
      const next = calculatePositionAfter('desc', { surahNumber: 78, ayahNumber: 10 }, mockSurahs);
      expect(next).toEqual({ surahNumber: 78, ayahNumber: 11 });
    });

    it('moves to the first ayah of the preceding surah at surah end (desc 78:40 -> 77:1)', () => {
      const next = calculatePositionAfter('desc', { surahNumber: 78, ayahNumber: 40 }, mockSurahs);
      expect(next).toEqual({ surahNumber: 77, ayahNumber: 1 });
    });

    it('returns null at the end of the Quran in desc (desc 1:7 -> null)', () => {
      const next = calculatePositionAfter('desc', { surahNumber: 1, ayahNumber: 7 }, mockSurahs);
      expect(next).toBeNull();
    });
  });

  describe('validation errors', () => {
    it('throws when surah is not in surahsList', () => {
      expect(() => {
        calculatePositionAfter('asc', { surahNumber: 999, ayahNumber: 1 }, mockSurahs);
      }).toThrow();
    });

    it('throws when ayahNumber is above surahLength', () => {
      expect(() => {
        calculatePositionAfter('asc', { surahNumber: 1, ayahNumber: 8 }, mockSurahs);
      }).toThrow();
    });

    it('throws when ayahNumber is less than 1', () => {
      expect(() => {
        calculatePositionAfter('asc', { surahNumber: 1, ayahNumber: 0 }, mockSurahs);
      }).toThrow();
    });
  });
});
