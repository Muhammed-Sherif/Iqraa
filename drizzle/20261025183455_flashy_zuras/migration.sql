CREATE TABLE `review_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`surahNumber` integer,
	`ayahNumber` integer,
	`kind` text NOT NULL,
	`rate` text NOT NULL,
	`taskId` integer,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `revision_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`planDate` integer NOT NULL,
	`surahNumber` integer NOT NULL,
	`startAyah` integer NOT NULL,
	`endAyah` integer NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`rate` text,
	`completedAt` integer
);
--> statement-breakpoint
CREATE TABLE `srs` (
	`surahNumber` integer NOT NULL,
	`ayahNumber` integer NOT NULL,
	`step` integer DEFAULT 0 NOT NULL,
	`state` text DEFAULT 'awaitingAssessment' NOT NULL,
	`nextDueAt` integer NOT NULL,
	`lastRate` text,
	`failCount` integer DEFAULT 0 NOT NULL,
	`source` text NOT NULL,
	CONSTRAINT `srs_pk` PRIMARY KEY(`surahNumber`, `ayahNumber`)
);
--> statement-breakpoint
ALTER TABLE `settings` ADD `newMemorizationEnabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_progress` (
	`id` integer PRIMARY KEY,
	`currentSurah` integer,
	`currentAyah` integer,
	`level` text DEFAULT 'beginner' NOT NULL,
	`direction` text DEFAULT 'asc' NOT NULL,
	`numberOfNewAyat` integer NOT NULL,
	`userType` text DEFAULT 'notHafiz' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_progress`(`id`, `currentSurah`, `currentAyah`, `level`, `direction`, `numberOfNewAyat`, `userType`) SELECT `id`, `currentSurah`, `currentAyah`, `level`, `direction`, `numberOfNewAyat`, `userType` FROM `progress`;--> statement-breakpoint
DROP TABLE `progress`;--> statement-breakpoint
ALTER TABLE `__new_progress` RENAME TO `progress`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `revision_tasks_plan_surah_start_unique` ON `revision_tasks` (`planDate`,`surahNumber`,`startAyah`);