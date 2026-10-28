import { db } from '../client';
import { tasksTable } from '../schema';
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm';
import { MemorizationTask } from '@/core/types';

function mapToMemorizationTask(
  row: typeof tasksTable.$inferSelect,
): MemorizationTask {
  return {
    taskId: row.id,
    surahNumber: row.surahNumber,
    ayatNumbers: row.ayatNumbers,
    minimumAyatNumbers: row.minimumAyatNumbers,
    completedCount: row.completedCount,
    dueDate: row.dueDate,
    status: row.status,
    type: row.type,
  };
}

export const taskRepository = {
  /**
   * Retrieves all tasks ordered by dueDate descending.
   */
  async getAllTasks(): Promise<MemorizationTask[]> {
    const rows = await db
      .select()
      .from(tasksTable)
      .orderBy(desc(tasksTable.dueDate));
    return rows.map(mapToMemorizationTask);
  },

  /**
   * Retrieves tasks scheduled for today.
   */
  async getTodayTasks(): Promise<MemorizationTask[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = startOfDay.getTime();

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const endTimestamp = endOfDay.getTime();

    const rows = await db
      .select()
      .from(tasksTable)
      .where(
        and(
          gte(tasksTable.dueDate, startTimestamp),
          lte(tasksTable.dueDate, endTimestamp),
        ),
      )
      .orderBy(asc(tasksTable.id));

    return rows.map(mapToMemorizationTask);
  },

  /**
   * Retrieves a task by its ID.
   */
  async getTaskById(id: number): Promise<MemorizationTask | null> {
    const rows = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id))
      .limit(1);
    return rows[0] ? mapToMemorizationTask(rows[0]) : null;
  },

  /**
   * Retrieves all tasks with a specific status.
   */
  async getTasksByStatus(
    status: 'notStarted' | 'inProgress' | 'completed',
  ): Promise<MemorizationTask[]> {
    const rows = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.status, status))
      .orderBy(desc(tasksTable.dueDate));
    return rows.map(mapToMemorizationTask);
  },

  /**
   * Saves a single planned task to the database.
   */
  async saveTask(task: MemorizationTask): Promise<MemorizationTask> {
    const rows = await db
      .insert(tasksTable)
      .values({
        surahNumber: task.surahNumber,
        ayatNumbers: task.ayatNumbers,
        minimumAyatNumbers: task.minimumAyatNumbers,
        completedCount: task.completedCount,
        dueDate: task.dueDate,
        status: task.status,
        type: task.type,
      })
      .returning();

    return mapToMemorizationTask(rows[0]);
  },

  /**
   * Saves multiple planned tasks to the database and returns them with their generated IDs.
   */
  async saveTasks(tasks: MemorizationTask[]): Promise<MemorizationTask[]> {
    if (tasks.length === 0) return [];

    const rows = await db
      .insert(tasksTable)
      .values(
        tasks.map((task) => ({
          surahNumber: task.surahNumber,
          ayatNumbers: task.ayatNumbers,
          minimumAyatNumbers: task.minimumAyatNumbers,
          completedCount: task.completedCount,
          dueDate: task.dueDate,
          status: task.status,
          type: task.type,
        })),
      )
      .returning();

    return rows.map(mapToMemorizationTask);
  },

  /**
   * Updates a task by ID.
   */
  async updateTask(
    id: number,
    data: Partial<Omit<typeof tasksTable.$inferInsert, 'id'>>,
  ) {
    return db.update(tasksTable).set(data).where(eq(tasksTable.id, id));
  },

  /**
   * Marks a task as completed.
   */
  async completeTask(id: number) {
    return db
      .update(tasksTable)
      .set({ status: 'completed' })
      .where(eq(tasksTable.id, id));
  },

  /**
   * Deletes a task by ID.
   */
  async deleteTask(id: number) {
    return db.delete(tasksTable).where(eq(tasksTable.id, id));
  },
};
