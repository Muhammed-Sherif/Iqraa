import { db, withTransaction } from '@/db/client';
import { progressTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  ayahRepository,
  progressRepository,
  revisionRepository,
  sessionRepository,
  srsRepository,
  surahRepository,
  taskRepository,
} from '@/db/repository';
import { AyahText, MemorizationTask, Rate, Srs } from '@/core/types';
import { scheduleNextReview } from '@/core/srs/srs';
import { adjustDailyGoal } from '@/core/application/adjustDailyGoal';
import planner from '@/core/memorization/planner';

export const memorizationService = {
  /**
   * Retrieves today's memorization tasks.
   * If no tasks exist for today, it loads the current memorization position,
   * daily goal, and surah list, plans the next tasks, and saves them.
   *
   * @returns List of today's memorization tasks
   */
  async getTodayMemorizationTasks(): Promise<MemorizationTask[]> {
    const todayTasks = await taskRepository.getTodayTasks();
    if (todayTasks.length > 0) {
      console.log(todayTasks)
      return todayTasks;
    }

    const [progress, position, dailyGoal, surahList] = await Promise.all([
      progressRepository.getProgress(),
      progressRepository.getMemorizationPosition(),
      progressRepository.getDailyGoal(),
      surahRepository.getSurahListForPlanner(),
    ]);

    if (!position || surahList.length === 0) {
      return [];
    }

    const direction = progress?.direction ?? 'asc';
    const plannedTasks = planner(dailyGoal, position, surahList, direction);
    if (plannedTasks.length === 0) {
      return [];
    }

    return taskRepository.saveTasks(plannedTasks);
  },

  /**
   * Retrieves a map of surahNumber to surah name for display in the UI.
   *
   * @returns Record mapping surahNumber to Arabic surah name
   */
  async getSurahNames(): Promise<Record<number, string>> {
    const allSurahs = await surahRepository.getAllSurahs();
    const map: Record<number, string> = {};
    for (const s of allSurahs) {
      map[s.surahNumber] = s.name;
    }
    return map;
  },

  /**
   * Retrieves the text of specific ayat for a given surah.
   *
   * @param surahNumber - The surah number (1-114).
   * @param ayatNumbers - Array of ayah numbers within the surah.
   * @returns Array of AyahText objects with num and text.
   */
  async getAyatText(
    surahNumber: number,
    ayatNumbers: number[],
  ): Promise<AyahText[]> {
    const rows = await ayahRepository.getAyatByNumbers(surahNumber, ayatNumbers);
    return rows.map((r) => ({
      num: r.ayahNumber,
      text: r.text,
    }));
  },

  /**
   * Saves the recorded audio URI for a memorization session task.
   *
   * @param taskId - The task ID associated with the recording.
   * @param audioUri - Local file URI of the recorded audio.
   */
  async saveRecordedAudio(taskId: number, audioUri: string): Promise<void> {
    await sessionRepository.saveRecordedAudio(taskId, audioUri);
  },
  /**
   * Records the final tasmee rating of a new memorization task in a single transaction.
   *
   * Actions:
   * 1. Marks the memorization task as completed.
   * 2. Initializes each ayah in SRS (source: 'new', step 0) and schedules its review using scheduleNextReview.
   * 3. Adjusts the daily memorization goal according to the rating.
   * 4. Logs a 'tasmee' review event in reviewEvents.
   *
   * @param task - Completed memorization task
   * @param rate - Rating given ('easy' | 'good' | 'hard')
   * @param now - Current timestamp (default: Date.now())
   */
  async recordTasmeeResult(
    task: MemorizationTask,
    rate: Rate,
    now: number = Date.now(),
  ): Promise<void> {
    await withTransaction(async () => {
      // 1. Mark task completed
      await taskRepository.completeTask(task.taskId);

      // 2. Schedule SRS items for each ayah
      for (const ayahNumber of task.ayatNumbers) {
        const initialSrs: Srs = {
          step: 0,
          state: 'awaitingAssessment',
          nextDueAt: 0,
          lastRate: rate,
          failCount: 0,
        };

        const scheduled = scheduleNextReview(initialSrs, rate, now);

        await srsRepository.upsertItem({
          surahNumber: task.surahNumber,
          ayahNumber,
          step: scheduled.step,
          state: scheduled.state,
          nextDueAt: scheduled.nextDueAt,
          lastRate: scheduled.lastRate,
          failCount: scheduled.failCount,
          source: 'new',
        });
      }

      // 3. Adjust daily goal once for the session and advance memorization position
      const progress = await progressRepository.getProgress();
      if (progress) {
        const adjusted = adjustDailyGoal(
          { numberOfNewAyat: progress.numberOfNewAyat },
          rate,
          progress.level,
        );

        const lastMemorizedAyah =
          task.ayatNumbers.length > 0
            ? Math.max(...task.ayatNumbers)
            : progress.currentAyah;

        await db
          .update(progressTable)
          .set({
            numberOfNewAyat: adjusted.numberOfNewAyat,
            currentSurah: task.surahNumber,
            currentAyah: lastMemorizedAyah,
          })
          .where(eq(progressTable.id, 1));
      }

      // 4. Log append-only review event
      await revisionRepository.addReviewEvent({
        surahNumber: task.surahNumber,
        kind: 'tasmee',
        rate,
        taskId: task.taskId,
        createdAt: now,
      });
    });
  },
};
