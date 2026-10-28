import { settingsRepository } from '@/db/repository';
import { ListeningSettings } from '@/core/types';

export interface AppSettings {
  repeatCount: number;
  sakta: number;
  reciter: string;
  newMemorizationEnabled: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  repeatCount: 3,
  sakta: 2,
  reciter: 'ar.alafasy',
  newMemorizationEnabled: true,
};

/**
 * Service to manage app preferences and listening session configuration.
 * Adheres to layer separation: UI -> Hook -> Service -> Repository -> SQLite.
 */
export const settingsService = {
  /**
   * Retrieves the current user app settings from the repository.
   *
   * @returns {Promise<AppSettings>} Current application settings.
   */
  async getSettings(): Promise<AppSettings> {
    const row = await settingsRepository.getSettings();
    return {
      repeatCount: row.repeatCount,
      sakta: row.sakta,
      reciter: row.reciter,
      newMemorizationEnabled: Boolean(row.newMemorizationEnabled),
    };
  },

  /**
   * Retrieves the listening settings ({ repeatCount, sakta }) for playback sessions.
   *
   * @returns {Promise<ListeningSettings>} Listening session configuration.
   */
  async getListeningSettings(): Promise<ListeningSettings> {
    return settingsRepository.getListeningSettings();
  },

  /**
   * Updates partial app settings and persists them to the database.
   *
   * @param {Partial<AppSettings>} partial - Settings fields to update.
   * @returns {Promise<void>} Resolves when saved.
   */
  async updateSettings(partial: Partial<AppSettings>): Promise<void> {
    await settingsRepository.updateSettings(partial);
  },
};
