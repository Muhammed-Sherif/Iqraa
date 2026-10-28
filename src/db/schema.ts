import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const tasksTable = sqliteTable('tasks', {
  id: integer().primaryKey({ autoIncrement: true }),
  surahNumber: integer().notNull(),
  ayatNumbers: text({ mode: 'json' }).$type<number[]>().notNull(),
  minimumAyatNumbers: text({ mode: 'json' }).$type<number[]>().notNull(),
  completedCount: integer().notNull().default(0),
  dueDate: integer().notNull(),
  status: text({ enum: ['notStarted', 'inProgress', 'completed'] })
    .notNull()
    .default('notStarted'),
  type: text({ enum: ['new', 'reinforcement'] })
    .notNull()
    .default('new'),
});

export const progressTable = sqliteTable('progress', {
  id: integer().primaryKey(), // always the same row (id = 1)
  currentSurah: integer(), // null = nothing left to memorize (e.g. Hafiz or finished)
  currentAyah: integer(), // null = nothing left to memorize
  level: text({ enum: ['beginner', 'intermediate', 'advanced', 'expert'] })
    .notNull()
    .default('beginner'),
  direction: text({ enum: ['asc', 'desc'] })
    .notNull()
    .default('asc'),
  numberOfNewAyat: integer().notNull(), // the daily goal
  userType: text({ enum: ['notHafiz', 'partiallyHafiz', 'hafiz'] })
    .notNull()
    .default('notHafiz'),
});

export const sessionsTable = sqliteTable('sessions', {
  taskId: integer().primaryKey(), // one session per task
  phase: text({ enum: ['reading', 'listening', 'tasmee'] }).notNull(),
  currentStep: integer(), // only used in listening
  repeatedCount: integer(), // only used in listening
  rate: text({ enum: ['easy', 'good', 'hard'] }), // only used in tasmee
  audioUri: text(),
});

export const surahsTable = sqliteTable('surahs', {
  surahNumber: integer().primaryKey(),
  name: text().notNull(),
  ayahCount: integer().notNull(), // your surahLength
});

export const ayatTable = sqliteTable(
  'ayat',
  {
    surahNumber: integer().notNull(),
    ayahNumber: integer().notNull(),
    text: text().notNull(),
  },
  (table) => [primaryKey({ columns: [table.surahNumber, table.ayahNumber] })],
);

export const audioTable = sqliteTable(
  'audio',
  {
    surahNumber: integer().notNull(),
    ayahNumber: integer().notNull(),
    reciter: text().notNull(),
    remoteUrl: text().notNull(),
    localPath: text(), // empty until the user downloads the file
  },
  (table) => [
    primaryKey({
      columns: [table.surahNumber, table.ayahNumber, table.reciter],
    }),
  ],
);

export const srsTable = sqliteTable(
  'srs',
  {
    surahNumber: integer().notNull(),
    ayahNumber: integer().notNull(),
    step: integer().notNull().default(0),
    state: text({ enum: ['awaitingAssessment', 'active', 'weak'] })
      .notNull()
      .default('awaitingAssessment'),
    nextDueAt: integer().notNull(),
    lastRate: text({ enum: ['easy', 'good', 'hard'] }),
    failCount: integer().notNull().default(0),
    source: text({ enum: ['new', 'existing'] }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.surahNumber, table.ayahNumber],
    }),
  ],
);

export const settingsTable = sqliteTable('settings', {
  id: integer().primaryKey(), // always the same row (id = 1)
  repeatCount: integer().notNull().default(3),
  sakta: integer().notNull().default(2),
  reciter: text().notNull(),
  newMemorizationEnabled: integer({ mode: 'boolean' }).notNull().default(true),
});

export const reviewEventsTable = sqliteTable('review_events', {
  id: integer().primaryKey({ autoIncrement: true }),
  surahNumber: integer(),
  ayahNumber: integer(),
  kind: text({
    enum: ['tasmee', 'revision', 'practice', 'sessionFinal'],
  }).notNull(),
  rate: text({ enum: ['easy', 'good', 'hard'] }).notNull(),
  taskId: integer(),
  createdAt: integer().notNull(),
});

export const revisionTasksTable = sqliteTable(
  'revision_tasks',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    planDate: integer().notNull(),
    surahNumber: integer().notNull(),
    startAyah: integer().notNull(),
    endAyah: integer().notNull(),
    type: text({
      enum: ['scheduled', 'initialAssessment', 'focused'],
    }).notNull(),
    status: text({ enum: ['pending', 'inProgress', 'completed', 'skipped'] })
      .notNull()
      .default('pending'),
    rate: text({ enum: ['easy', 'good', 'hard'] }),
    completedAt: integer(),
  },
  (table) => [
    uniqueIndex('revision_tasks_plan_surah_start_unique').on(
      table.planDate,
      table.surahNumber,
      table.startAyah,
    ),
  ],
);

export const downloadsTable = sqliteTable('downloads', {
  id: integer().primaryKey({ autoIncrement: true }),
  reciter: text().notNull(),
  surahNumber: integer(), // null = all surahs, or specific surahNumber (1-114)
  status: text({ enum: ['pending', 'downloading', 'completed', 'failed'] })
    .notNull()
    .default('pending'),
  downloadedCount: integer().notNull().default(0),
  totalCount: integer().notNull().default(0),
  localPath: text(),
  createdAt: integer().notNull(),
  updatedAt: integer().notNull(),
});
