import { db } from './client';
import { ayatTable, surahsTable } from './schema';

const QURAN_API_URL = 'https://api.alquran.cloud/v1/quran/quran-uthmani';

interface ApiAyah {
  numberInSurah: number;
  text: string;
}

interface ApiSurah {
  number: number;
  name: string;
  numberOfAyahs?: number;
  ayahs: ApiAyah[];
}

interface ApiResponse {
  code: number;
  status: string;
  data: {
    surahs: ApiSurah[];
  };
}

/**
 * Fetches the entire Quran from the Al-Quran Cloud API and seeds
 * the `surahs` and `ayat` tables. Inserts are batched to avoid
 * hitting SQLite parameter limits.
 */
export async function seedQuran(): Promise<void> {
  const response = await fetch(QURAN_API_URL);

  if (!response.ok) {
    throw new Error(
      `Quran API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const json: ApiResponse = await response.json();

  if (json.code !== 200 || !json.data?.surahs) {
    throw new Error(`Unexpected API response: ${json.status}`);
  }

  const surahs = json.data.surahs;

  // ── Insert all surahs ──────────────────────────────────────────────────────
  const surahRows = surahs.map((s) => ({
    surahNumber: s.number,
    name: s.name,
    ayahCount: s.numberOfAyahs ?? s.ayahs?.length ?? 0,
  }));

  // Insert in batches of 50 to stay well under SQLite limits
  const BATCH_SIZE = 50;
  for (let i = 0; i < surahRows.length; i += BATCH_SIZE) {
    await db
      .insert(surahsTable)
      .values(surahRows.slice(i, i + BATCH_SIZE))
      .onConflictDoNothing();
  }

  // ── Insert all ayat ───────────────────────────────────────────────────────
  const ayatRows = surahs.flatMap((s) =>
    s.ayahs.map((a) => ({
      surahNumber: s.number,
      ayahNumber: a.numberInSurah,
      text: a.text,
    })),
  );

  // Insert in batches of 100 (3 columns × 100 = 300 params, well under limit)
  for (let i = 0; i < ayatRows.length; i += BATCH_SIZE) {
    await db
      .insert(ayatTable)
      .values(ayatRows.slice(i, i + BATCH_SIZE))
      .onConflictDoNothing();
  }

  console.log(
    `[seed] Seeded ${surahRows.length} surahs and ${ayatRows.length} ayat successfully.`,
  );
}
