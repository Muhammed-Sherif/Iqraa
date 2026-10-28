import * as FileSystem from 'expo-file-system/legacy';
import { db } from '@/db/client';
import { audioTable, downloadsTable } from '@/db/schema';
import { surahRepository } from '@/db/repository';
import { and, eq, isNull, or } from 'drizzle-orm';

export interface ReciterInfo {
  id: string;
  nameArabic: string;
  subfolder: string;
}

export const SUPPORTED_RECITERS: Record<string, ReciterInfo> = {
  'ar.alafasy': {
    id: 'ar.alafasy',
    nameArabic: 'مشاري بن راشد العفاسي',
    subfolder: 'Alafasy_128kbps',
  },
  'ar.abdurrahmaansudais': {
    id: 'ar.abdurrahmaansudais',
    nameArabic: 'عبد الرحمن السديس',
    subfolder: 'Abdurrahmaan_As-Sudais_192kbps',
  },
  'ar.husary': {
    id: 'ar.husary',
    nameArabic: 'محمود خليل الحصري',
    subfolder: 'Husary_128kbps',
  },
  'ar.minshawi': {
    id: 'ar.minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    subfolder: 'Minshawy_Mujawwad_192kbps',
  },
  'ar.mahermuaiqly': {
    id: 'ar.mahermuaiqly',
    nameArabic: 'ماهر المعيقلي',
    subfolder: 'MaherAlMuaiqly128kbps',
  },
};

export interface DownloadProgress {
  surahNumber: number;
  currentAyah: number;
  totalAyatInSurah: number;
  completedSurahs: number;
  totalSurahs: number;
  percent: number;
}

/**
 * Service to manage Quran audio downloads, file storage, and playback URLs.
 */
export const audioService = {
  /**
   * Builds the remote CDN URL for an ayah audio file.
   */
  getRemoteAudioUrl(
    reciterId: string,
    surahNumber: number,
    ayahNumber: number,
  ): string {
    const reciter =
      SUPPORTED_RECITERS[reciterId] ?? SUPPORTED_RECITERS['ar.alafasy'];
    const s = String(surahNumber).padStart(3, '0');
    const a = String(ayahNumber).padStart(3, '0');
    return `https://everyayah.com/data/${reciter.subfolder}/${s}${a}.mp3`;
  },

  /**
   * Resolves the local filesystem path for a given ayah audio file.
   */
  getLocalAudioPath(
    reciterId: string,
    surahNumber: number,
    ayahNumber: number,
  ): string {
    const s = String(surahNumber).padStart(3, '0');
    const a = String(ayahNumber).padStart(3, '0');
    const baseDir = FileSystem.documentDirectory ?? '';
    return `${baseDir}audio/${reciterId}/${s}${a}.mp3`;
  },

  /**
   * Ensures the local directory for the reciter audio files exists.
   */
  async ensureAudioDirectory(reciterId: string): Promise<string> {
    const baseDir = FileSystem.documentDirectory ?? '';
    const dir = `${baseDir}audio/${reciterId}/`;
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    return dir;
  },

  /**
   * Returns a playable URI for an ayah. Returns local path if downloaded,
   * otherwise falls back to remote streaming URL.
   */
  async getPlayableUri(
    surahNumber: number,
    ayahNumber: number,
    reciterId: string = 'ar.alafasy',
  ): Promise<string> {
    const localPath = this.getLocalAudioPath(
      reciterId,
      surahNumber,
      ayahNumber,
    );
    try {
      const info = await FileSystem.getInfoAsync(localPath);
      if (info.exists) {
        return localPath;
      }
    } catch {
      // Fallback to remote if filesystem check fails
    }
    return this.getRemoteAudioUrl(reciterId, surahNumber, ayahNumber);
  },

  /**
   * Downloads all audio files for a specific surah.
   */
  async downloadSurah(
    surahNumber: number,
    reciterId: string = 'ar.alafasy',
    onProgress?: (progress: DownloadProgress) => void,
    isCancelled?: () => boolean,
  ): Promise<void> {
    const surah = await surahRepository.getSurahByNumber(surahNumber);
    if (!surah) {
      throw new Error(`Surah ${surahNumber} not found`);
    }

    await this.ensureAudioDirectory(reciterId);
    const totalAyat = surah.ayahCount;

    for (let ayah = 1; ayah <= totalAyat; ayah++) {
      if (isCancelled && isCancelled()) {
        break;
      }

      const remoteUrl = this.getRemoteAudioUrl(reciterId, surahNumber, ayah);
      const localPath = this.getLocalAudioPath(reciterId, surahNumber, ayah);

      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (!fileInfo.exists) {
        await FileSystem.downloadAsync(remoteUrl, localPath);
      }

      // Record in audioTable
      await db
        .insert(audioTable)
        .values({
          surahNumber,
          ayahNumber: ayah,
          reciter: reciterId,
          remoteUrl,
          localPath,
        })
        .onConflictDoUpdate({
          target: [
            audioTable.surahNumber,
            audioTable.ayahNumber,
            audioTable.reciter,
          ],
          set: { localPath },
        });

      if (onProgress) {
        onProgress({
          surahNumber,
          currentAyah: ayah,
          totalAyatInSurah: totalAyat,
          completedSurahs: 0,
          totalSurahs: 1,
          percent: Math.round((ayah / totalAyat) * 100),
        });
      }
    }

    // Mark surah download completed in downloadsTable
    const now = Date.now();
    await db.insert(downloadsTable).values({
      reciter: reciterId,
      surahNumber,
      status: 'completed',
      downloadedCount: totalAyat,
      totalCount: totalAyat,
      localPath: this.getLocalAudioPath(reciterId, surahNumber, 1),
      createdAt: now,
      updatedAt: now,
    });
  },

  /**
   * Downloads the complete Quran audio for a given reciter.
   */
  async downloadCompleteQuran(
    reciterId: string = 'ar.alafasy',
    onProgress?: (progress: DownloadProgress) => void,
    isCancelled?: () => boolean,
  ): Promise<void> {
    const surahs = await surahRepository.getSurahListForPlanner();
    const totalSurahs = surahs.length;

    await this.ensureAudioDirectory(reciterId);

    for (let sIdx = 0; sIdx < totalSurahs; sIdx++) {
      if (isCancelled && isCancelled()) {
        break;
      }

      const surah = surahs[sIdx];
      const totalAyat = surah.surahLength;

      for (let ayah = 1; ayah <= totalAyat; ayah++) {
        if (isCancelled && isCancelled()) {
          break;
        }

        const remoteUrl = this.getRemoteAudioUrl(
          reciterId,
          surah.surahNumber,
          ayah,
        );
        const localPath = this.getLocalAudioPath(
          reciterId,
          surah.surahNumber,
          ayah,
        );

        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (!fileInfo.exists) {
          await FileSystem.downloadAsync(remoteUrl, localPath);
        }

        await db
          .insert(audioTable)
          .values({
            surahNumber: surah.surahNumber,
            ayahNumber: ayah,
            reciter: reciterId,
            remoteUrl,
            localPath,
          })
          .onConflictDoUpdate({
            target: [
              audioTable.surahNumber,
              audioTable.ayahNumber,
              audioTable.reciter,
            ],
            set: { localPath },
          });

        if (onProgress) {
          const overallPercent = Math.round(
            ((sIdx + ayah / totalAyat) / totalSurahs) * 100,
          );
          onProgress({
            surahNumber: surah.surahNumber,
            currentAyah: ayah,
            totalAyatInSurah: totalAyat,
            completedSurahs: sIdx,
            totalSurahs,
            percent: overallPercent,
          });
        }
      }
    }

    // Mark entire Quran as completed
    const now = Date.now();
    await db.insert(downloadsTable).values({
      reciter: reciterId,
      surahNumber: null,
      status: 'completed',
      downloadedCount: 6236,
      totalCount: 6236,
      createdAt: now,
      updatedAt: now,
    });
  },

  /**
   * Checks whether the full Quran or a specific surah has been downloaded.
   *
   * @param reciterId - Reciter identifier.
   * @param surahNumber - Optional surah number.
   * @returns Boolean indicating whether audio is downloaded.
   */
  async isAudioDownloaded(
    reciterId: string = 'ar.alafasy',
    surahNumber?: number,
  ): Promise<boolean> {
    const conditions = [
      eq(downloadsTable.reciter, reciterId),
      eq(downloadsTable.status, 'completed'),
    ];

    if (surahNumber !== undefined) {
      conditions.push(
        or(
          isNull(downloadsTable.surahNumber),
          eq(downloadsTable.surahNumber, surahNumber),
        )!,
      );
    } else {
      conditions.push(isNull(downloadsTable.surahNumber));
    }

    const rows = await db
      .select({ id: downloadsTable.id })
      .from(downloadsTable)
      .where(and(...conditions))
      .limit(1);

    return rows.length > 0;
  },

  /**
   * Checks whether the full Quran or a specific surah has been downloaded.
   */
  async checkDownloadStatus(
    reciterId: string = 'ar.alafasy',
    surahNumber?: number,
  ): Promise<boolean> {
    return this.isAudioDownloaded(reciterId, surahNumber);
  },
};
