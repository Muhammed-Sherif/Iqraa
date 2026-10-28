import { db, withTransaction } from '@/db/client';
import { progressTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  ayahRepository,
  progressRepository,
  revisionRepository,
  settingsRepository,
  srsRepository,
  surahRepository,
  taskRepository,
} from '@/db/repository';
import { MemorizationTask, Rate, RevisionTask, Srs } from '@/core/types';
import { planDailyMix } from '@/core/revision/planDailyMix';
import { selectDueItems } from '@/core/revision/selectDueItems';
import { groupIntoTasks } from '@/core/revision/groupIntoTasks';
import { scheduleNextReview, startOfDayAfter } from '@/core/srs/srs';
import { adjustDailyGoal } from '@/core/application/adjustDailyGoal';
import { WeaknessChoice } from '@/core/revision/types';

export interface HardHandoffData {
  taskId: number;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
}

export interface TaskPassage {
  surahNumber: number;
  surahNameArabic: string;
  startAyah: number;
  endAyah: number;
  ayat: {
    ayahNumber: number;
    text: string;
  }[];
}

export interface DueSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueCount: number;
  isSessionFinished: boolean;
  tasks: RevisionTask[];
}

export interface WeakAyahItem {
  surahNumber: number;
  ayahNumber: number;
  failCount: number;
  lastRate: Rate | null;
  step: number;
}

export const revisionService = {
  /**
   * Retrieves or builds today's revision tasks in an idempotent manner.
   * If tasks already exist for today, returns them without re-planning.
   *
   * @param now - Current timestamp (default: Date.now())
   * @returns List of RevisionTask items for today
   */
  async getTodayRevisionTasks(
    now: number = Date.now(),
  ): Promise<RevisionTask[]> {
    const planDate = startOfDayAfter(now, 0);

    // 1. Fetch existing tasks planned for today
    const existingTasks = await revisionRepository.getTasksForDate(planDate);

    // 2. Fetch progress and settings
    const progress = await progressRepository.getProgress();
    if (!progress) {
      return existingTasks;
    }

    const settings = await settingsRepository.getSettings();
    const newMemorizationEnabled = settings.newMemorizationEnabled;

    // 3. Fetch all SRS items
    const allItems = await srsRepository.getAllItems();
    const overdueCount = allItems.filter(
      (item) => item.nextDueAt <= now,
    ).length;

    // 4. Calculate daily mix
    const mix = planDailyMix(
      progress.userType,
      progress.level,
      overdueCount,
      newMemorizationEnabled,
    );

    // 5. Check which ayat are already covered by existing tasks for today
    const coveredAyat = new Set<string>();
    for (const t of existingTasks) {
      for (let a = t.startAyah; a <= t.endAyah; a++) {
        coveredAyat.add(`${t.surahNumber}:${a}`);
      }
    }

    // Filter candidate SRS items to only those not yet covered by today's tasks
    const candidateItems = allItems.filter(
      (item) => !coveredAyat.has(`${item.surahNumber}:${item.ayahNumber}`),
    );

    const remainingLimit = Math.max(0, mix.revisionCount - coveredAyat.size);
    if (candidateItems.length === 0 || remainingLimit === 0) {
      return existingTasks;
    }

    // 6. Select due items in priority order among uncovered candidates
    const uncoveredDueItems = selectDueItems(
      candidateItems,
      now,
      remainingLimit,
      progress.direction,
    );

    if (uncoveredDueItems.length === 0) {
      return existingTasks;
    }

    // 7. Group uncovered items into tasks (consecutive ayat in same surah form a single continuous task)
    const drafts = groupIntoTasks(
      uncoveredDueItems,
      progress.direction,
    );

    if (drafts.length === 0) {
      return existingTasks;
    }

    // 8. Save new tasks atomically
    const tasksToInsert = drafts.map((d) => ({
      planDate,
      surahNumber: d.surahNumber,
      startAyah: d.startAyah,
      endAyah: d.endAyah,
      type: 'scheduled' as const,
      status: 'pending' as const,
    }));

    await withTransaction(async () => {
      await revisionRepository.saveRevisionTasks(tasksToInsert);
    });

    return revisionRepository.getTasksForDate(planDate);
  },

  /**
   * Submits a rating for an individual revision task in a single transaction.
   * Idempotent: ignored if the task is already completed.
   *
   * @param taskId - ID of the revision task
   * @param rate - Rating given ('easy' | 'good' | 'hard')
   * @param now - Current timestamp (default: Date.now())
   * @returns HardHandoffData if rate is 'hard', otherwise null
   */
  async submitTaskRating(
    taskId: number,
    rate: Rate,
    now: number = Date.now(),
  ): Promise<HardHandoffData | null> {
    let handoff: HardHandoffData | null = null;

    await withTransaction(async () => {
      const task = await revisionRepository.getTaskById(taskId);
      if (!task || task.status === 'completed') {
        return;
      }

      // 1. Mark task completed
      await revisionRepository.updateRevisionTask(taskId, {
        status: 'completed',
        rate,
        completedAt: now,
      });

      // 2. Fetch all ayat in this task from SRS
      const ayatNumbers: number[] = [];
      for (let a = task.startAyah; a <= task.endAyah; a++) {
        ayatNumbers.push(a);
      }

      const srsItems = await srsRepository.getItemsForAyat(
        task.surahNumber,
        ayatNumbers,
      );
      const srsMap = new Map(srsItems.map((item) => [item.ayahNumber, item]));

      // 3. Update SRS schedule for each ayah
      for (const ayah of ayatNumbers) {
        const srsItem = srsMap.get(ayah);
        const existing: Srs = {
          step: srsItem?.step ?? 0,
          state: srsItem?.state ?? 'awaitingAssessment',
          nextDueAt: srsItem?.nextDueAt ?? 0,
          lastRate: srsItem?.lastRate ?? null,
          failCount: srsItem?.failCount ?? 0,
        };

        const updated = scheduleNextReview(existing, rate, now);

        await srsRepository.upsertItem({
          surahNumber: task.surahNumber,
          ayahNumber: ayah,
          step: updated.step,
          state: updated.state,
          nextDueAt: updated.nextDueAt,
          lastRate: updated.lastRate,
          failCount: updated.failCount,
          source: srsItem?.source ?? 'existing',
        });

        // 4. Record review event for each ayah in the passage
        await revisionRepository.addReviewEvent({
          surahNumber: task.surahNumber,
          ayahNumber: ayah,
          kind: 'revision',
          rate,
          taskId,
          createdAt: now,
        });
      }

      if (rate === 'hard') {
        handoff = {
          taskId,
          surahNumber: task.surahNumber,
          startAyah: task.startAyah,
          endAyah: task.endAyah,
        };
      }
    });

    return handoff;
  },

  /**
   * Starts a focused memorization session for weak ayat by creating a reinforcement MemorizationTask.
   * Reuses the existing memorization player.
   *
   * @param taskId - ID of the failed revision task
   * @param weakness - User's weakness choice ('wholePassage' | { ayah } | 'unknown')
   * @param now - Current timestamp (default: Date.now())
   * @returns Created reinforcement MemorizationTask
   */
  async startFocusedMemorization(
    taskId: number,
    weakness: WeaknessChoice,
    now: number = Date.now(),
  ): Promise<MemorizationTask> {
    const task = await revisionRepository.getTaskById(taskId);
    if (!task) {
      throw new Error(`Revision task ${taskId} not found`);
    }

    let weakAyat: number[] = [];
    if (typeof weakness === 'object' && 'ayah' in weakness) {
      weakAyat = [weakness.ayah];
    } else {
      // wholePassage or unknown
      for (let a = task.startAyah; a <= task.endAyah; a++) {
        weakAyat.push(a);
      }
    }

    const reinforcementTask = await taskRepository.saveTask({
      taskId: 0, // generated by database
      surahNumber: task.surahNumber,
      ayatNumbers: weakAyat,
      minimumAyatNumbers: weakAyat,
      completedCount: 0,
      dueDate: now,
      status: 'notStarted',
      type: 'reinforcement',
    });

    return reinforcementTask;
  },

  /**
   * Applies the final session rating, adjusts the daily goal once, and logs a 'sessionFinal' event.
   * Idempotent: a second call on the same calendar day is ignored.
   *
   * @param finalRate - Rating given for the session ('easy' | 'good' | 'hard')
   * @param now - Current timestamp (default: Date.now())
   */
  async finishRevisionSession(
    finalRate: Rate,
    now: number = Date.now(),
  ): Promise<void> {
    const startOfDay = startOfDayAfter(now, 0);
    const endOfDay = startOfDay + 86400000 - 1;

    // Idempotency check: ignore if already completed today
    const existing = await revisionRepository.getReviewEventsForDate(
      startOfDay,
      endOfDay,
      'sessionFinal',
    );
    if (existing.length > 0) {
      return;
    }

    await withTransaction(async () => {
      // 1. Adjust daily goal once for the entire session
      const progress = await progressRepository.getProgress();
      if (progress) {
        const adjusted = adjustDailyGoal(
          { numberOfNewAyat: progress.numberOfNewAyat },
          finalRate,
          progress.level,
        );

        await db
          .update(progressTable)
          .set({ numberOfNewAyat: adjusted.numberOfNewAyat })
          .where(eq(progressTable.id, 1));
      }

      // 2. Add append-only sessionFinal event
      await revisionRepository.addReviewEvent({
        kind: 'sessionFinal',
        rate: finalRate,
        createdAt: now,
      });
    });
  },

  /**
   * Logs a practice event in reviewEvents without changing any SRS state.
   *
   * @param surahNumber - Surah practiced
   * @param ayahNumber - Ayah practiced
   * @param rate - Practice performance rating
   * @param now - Current timestamp (default: Date.now())
   */
  async recordPracticeEvent(
    surahNumber: number,
    ayahNumber: number,
    rate: Rate,
    now: number = Date.now(),
  ): Promise<void> {
    await revisionRepository.addReviewEvent({
      surahNumber,
      ayahNumber,
      kind: 'practice',
      rate,
      createdAt: now,
    });
  },

  /**
   * Retrieves summary metrics for today's revision session.
   *
   * @param now - Current timestamp (default: Date.now())
   * @returns DueSummary containing task counts, overdue items count, and completion status
   */
  async getDueSummary(now: number = Date.now()): Promise<DueSummary> {
    const tasks = await this.getTodayRevisionTasks(now);
    const allItems = await srsRepository.getAllItems();
    const overdueCount = allItems.filter(
      (item) => item.nextDueAt <= now,
    ).length;

    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const isSessionFinished = tasks.length > 0 && pendingTasks === 0;

    return {
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      overdueCount,
      isSessionFinished,
      tasks,
    };
  },

  /**
   * Retrieves a list of weak Ayat (ayat that have failed at least once or whose last rate was 'hard').
   * Sorted descending by failCount.
   *
   * @returns List of WeakAyahItem
   */
  async getWeakAyat(): Promise<WeakAyahItem[]> {
    const allItems = await srsRepository.getAllItems();
    const weakItems = allItems.filter(
      (item) => item.failCount > 0 || item.lastRate === 'hard',
    );

    return weakItems
      .sort((a, b) => b.failCount - a.failCount)
      .map((item) => ({
        surahNumber: item.surahNumber,
        ayahNumber: item.ayahNumber,
        failCount: item.failCount,
        lastRate: item.lastRate ?? null,
        step: item.step,
      }));
  },

  /**
   * Retrieves surah details and Quranic text for a revision passage.
   *
   * @param surahNumber - Surah number
   * @param startAyah - First ayah number
   * @param endAyah - Last ayah number
   * @returns TaskPassage containing surah name and list of ayat with text
   */
  async getTaskPassage(
    surahNumber: number,
    startAyah: number,
    endAyah: number,
  ): Promise<TaskPassage> {
    const surah = await surahRepository.getSurahByNumber(surahNumber);
    const ayat = await ayahRepository.getAyatRange(
      surahNumber,
      startAyah,
      endAyah,
    );

    return {
      surahNumber,
      surahNameArabic: surah?.name ?? `سورة ${surahNumber}`,
      startAyah,
      endAyah,
      ayat: ayat.map((a) => ({
        ayahNumber: a.ayahNumber,
        text: a.text,
      })),
    };
  },
};
