import { db } from '../client';
import { revisionTasksTable, reviewEventsTable } from '../schema';
import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { ReviewEvent, RevisionTask } from '@/core/types';

function mapToRevisionTask(
  row: typeof revisionTasksTable.$inferSelect,
): RevisionTask {
  return {
    id: row.id,
    planDate: row.planDate,
    surahNumber: row.surahNumber,
    startAyah: row.startAyah,
    endAyah: row.endAyah,
    type: row.type,
    status: row.status,
    rate: row.rate,
    completedAt: row.completedAt,
  };
}

function mapToReviewEvent(
  row: typeof reviewEventsTable.$inferSelect,
): ReviewEvent {
  return {
    id: row.id,
    surahNumber: row.surahNumber,
    ayahNumber: row.ayahNumber,
    kind: row.kind,
    rate: row.rate,
    taskId: row.taskId,
    createdAt: row.createdAt,
  };
}

export const revisionRepository = {
  /**
   * Retrieves revision tasks planned for a specific day.
   */
  async getTasksForDate(planDate: number): Promise<RevisionTask[]> {
    const rows = await db
      .select()
      .from(revisionTasksTable)
      .where(eq(revisionTasksTable.planDate, planDate))
      .orderBy(asc(revisionTasksTable.id));

    return rows.map(mapToRevisionTask);
  },

  /**
   * Retrieves a single revision task by its primary key ID.
   */
  async getTaskById(taskId: number): Promise<RevisionTask | null> {
    const rows = await db
      .select()
      .from(revisionTasksTable)
      .where(eq(revisionTasksTable.id, taskId))
      .limit(1);

    return rows[0] ? mapToRevisionTask(rows[0]) : null;
  },

  /**
   * Inserts multiple planned revision tasks, returning the saved rows.
   */
  async saveRevisionTasks(
    tasks: Array<typeof revisionTasksTable.$inferInsert>,
  ): Promise<RevisionTask[]> {
    if (tasks.length === 0) return [];
    const rows = await db
      .insert(revisionTasksTable)
      .values(tasks)
      .onConflictDoNothing()
      .returning();

    return rows.map(mapToRevisionTask);
  },

  /**
   * Updates an existing revision task.
   */
  async updateRevisionTask(
    taskId: number,
    updates: Partial<typeof revisionTasksTable.$inferInsert>,
  ): Promise<void> {
    await db
      .update(revisionTasksTable)
      .set(updates)
      .where(eq(revisionTasksTable.id, taskId));
  },

  /**
   * Inserts an append-only review event.
   */
  async addReviewEvent(
    event: typeof reviewEventsTable.$inferInsert,
  ): Promise<void> {
    await db.insert(reviewEventsTable).values(event);
  },

  /**
   * Checks whether a review event of a specific kind exists for a given day.
   */
  async getReviewEventsForDate(
    startOfDay: number,
    endOfDay: number,
    kind: string,
  ): Promise<ReviewEvent[]> {
    const rows = await db
      .select()
      .from(reviewEventsTable)
      .where(
        and(
          eq(
            reviewEventsTable.kind,
            kind as 'tasmee' | 'revision' | 'practice' | 'sessionFinal',
          ),
          gte(reviewEventsTable.createdAt, startOfDay),
          lte(reviewEventsTable.createdAt, endOfDay),
        ),
      );

    return rows.map(mapToReviewEvent);
  },
};
