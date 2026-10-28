import { db } from '../client';
import { settingsTable } from '../schema';
import { eq } from 'drizzle-orm';
import { ListeningSettings } from '@/core/types';

export const settingsRepository = {
  /**
   * Retrieves the app settings (row id = 1).
   */
  async getSettings() {
    const rows = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.id, 1))
      .limit(1);

    if (rows.length > 0) {
      return rows[0];
    }

    const defaultSettings = {
      id: 1,
      repeatCount: 3,
      sakta: 2,
      reciter: 'ar.alafasy',
      newMemorizationEnabled: true,
    };

    await db
      .insert(settingsTable)
      .values(defaultSettings)
      .onConflictDoNothing();
    return defaultSettings;
  },

  /**
   * Retrieves listening settings ({ repeatCount, sakta }).
   */
  async getListeningSettings(): Promise<ListeningSettings> {
    const settings = await this.getSettings();
    return {
      repeatCount: settings.repeatCount,
      sakta: settings.sakta,
    };
  },

  /**
   * Updates settings fields.
   */
  async updateSettings(
    data: Partial<Omit<typeof settingsTable.$inferInsert, 'id'>>,
  ) {
    return db
      .insert(settingsTable)
      .values({
        id: 1,
        repeatCount: 3,
        sakta: 2,
        reciter: 'ar.alafasy',
        newMemorizationEnabled: true,
        ...data,
      })
      .onConflictDoUpdate({
        target: settingsTable.id,
        set: data,
      });
  },
};
