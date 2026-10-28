import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  tasksTable: {
    surah: r.one.surahsTable({
      from: r.tasksTable.surahNumber,
      to: r.surahsTable.surahNumber,
    }),
    session: r.one.sessionsTable({
      from: r.tasksTable.id,
      to: r.sessionsTable.taskId,
    }),
  },
  sessionsTable: {
    task: r.one.tasksTable({
      from: r.sessionsTable.taskId,
      to: r.tasksTable.id,
    }),
  },
  surahsTable: {
    tasks: r.many.tasksTable(),
    ayat: r.many.ayatTable(),
  },
  ayatTable: {
    surah: r.one.surahsTable({
      from: r.ayatTable.surahNumber,
      to: r.surahsTable.surahNumber,
    }),
    audio: r.many.audioTable(),
  },
  audioTable: {
    ayah: r.one.ayatTable({
      from: [r.audioTable.surahNumber, r.audioTable.ayahNumber],
      to: [r.ayatTable.surahNumber, r.ayatTable.ayahNumber],
    }),
  },
  progressTable: {
    surah: r.one.surahsTable({
      from: r.progressTable.currentSurah,
      to: r.surahsTable.surahNumber,
    }),
  },
}));
