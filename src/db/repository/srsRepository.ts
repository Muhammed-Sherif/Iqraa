import { db } from '../client';
import { srsTable } from '../schema';
import { and, eq, inArray } from 'drizzle-orm';
import { DueSrsItem } from '@/core/revision/types';

function mapToDueSrsItem(row: typeof srsTable.$inferSelect): DueSrsItem {
  return {
    surahNumber: row.surahNumber,
    ayahNumber: row.ayahNumber,
    step: row.step,
    state: row.state,
    nextDueAt: row.nextDueAt,
    lastRate: row.lastRate,
    failCount: row.failCount,
    source: row.source,
  };
}

export const srsRepository = {
  /**
   * Retrieves all SRS items from the database.
   */
  async getAllItems(): Promise<DueSrsItem[]> {
    const rows = await db.select().from(srsTable);
    return rows.map(mapToDueSrsItem);
  },

  /**
   * Retrieves SRS records for specific ayat in a given surah.
   */
  async getItemsForAyat(
    surahNumber: number,
    ayatNumbers: number[],
  ): Promise<DueSrsItem[]> {
    if (ayatNumbers.length === 0) return [];
    const rows = await db
      .select()
      .from(srsTable)
      .where(
        and(
          eq(srsTable.surahNumber, surahNumber),
          inArray(srsTable.ayahNumber, ayatNumbers),
        ),
      );
    return rows.map(mapToDueSrsItem);
  },

  /**
   * Upserts a single SRS item.
   */
  async upsertItem(item: typeof srsTable.$inferInsert): Promise<void> {
    await db
      .insert(srsTable)
      .values(item)
      .onConflictDoUpdate({
        target: [srsTable.surahNumber, srsTable.ayahNumber],
        set: {
          step: item.step,
          state: item.state,
          nextDueAt: item.nextDueAt,
          lastRate: item.lastRate,
          failCount: item.failCount,
          source: item.source,
        },
      });
  },

  /**
   * Batch inserts SRS items in chunks of 500 to stay well under SQLite parameter limits.
   */
  async batchInsertItems(
    items: Array<typeof srsTable.$inferInsert>,
  ): Promise<void> {
    if (items.length === 0) return;
    const CHUNK_SIZE = 500;

    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      await db.insert(srsTable).values(chunk).onConflictDoNothing();
    }
  },
};
