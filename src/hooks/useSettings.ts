import { useState, useEffect, useCallback, useRef } from 'react';
import { settingsService, AppSettings, DEFAULT_APP_SETTINGS } from '@/services';

export interface UseSettingsResult {
  settings: AppSettings;
  loading: boolean;
  saving: boolean;
  saveSettings: (partial: Partial<AppSettings>) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook to retrieve and update user application settings.
 * Adheres to layer separation: UI -> Hook -> Service -> Repository -> SQLite.
 *
 * @returns {UseSettingsResult} Settings state, loading/saving flags, and save/refresh handlers.
 */
export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      if (isMountedRef.current) {
        setSettings(data);
      }
    } catch (err) {
      console.error('[useSettings] Failed to fetch settings:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchSettings();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchSettings]);

  const saveSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
      setSaving(true);
      try {
        await settingsService.updateSettings(partial);
      } catch (err) {
        console.error('[useSettings] Failed to update settings:', err);
        throw err;
      } finally {
        if (isMountedRef.current) {
          setSaving(false);
        }
      }
    },
    [],
  );

  return {
    settings,
    loading,
    saving,
    saveSettings,
    refresh: fetchSettings,
  };
}
