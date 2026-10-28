import { db } from '../client';
import { sessionsTable } from '../schema';
import { eq } from 'drizzle-orm';

export const sessionRepository = {
  /**
   * Retrieves a session by its task ID.
   */
  async getSessionByTaskId(taskId: number) {
    const rows = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.taskId, taskId))
      .limit(1);
    return rows[0] ?? null;
  },

  /**
   * Saves or updates a session for a task.
   */
  async saveSession(session: typeof sessionsTable.$inferInsert) {
    return db.insert(sessionsTable).values(session).onConflictDoUpdate({
      target: sessionsTable.taskId,
      set: session,
    });
  },

  /**
   * Saves the recorded audio URI for a task session.
   */
  async saveRecordedAudio(taskId: number, audioUri: string) {
    return db
      .insert(sessionsTable)
      .values({
        taskId,
        phase: 'tasmee',
        audioUri,
      })
      .onConflictDoUpdate({
        target: sessionsTable.taskId,
        set: {
          audioUri,
          phase: 'tasmee',
        },
      });
  },

  /**
   * Deletes a session by its task ID.
   */
  async deleteSession(taskId: number) {
    return db.delete(sessionsTable).where(eq(sessionsTable.taskId, taskId));
  },
};
