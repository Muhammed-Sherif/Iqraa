CREATE TABLE `audio` (
	`surahNumber` integer NOT NULL,
	`ayahNumber` integer NOT NULL,
	`reciter` text NOT NULL,
	`remoteUrl` text NOT NULL,
	`localPath` text,
	CONSTRAINT `audio_pk` PRIMARY KEY(`surahNumber`, `ayahNumber`, `reciter`)
);
--> statement-breakpoint
CREATE TABLE `ayat` (
	`surahNumber` integer NOT NULL,
	`ayahNumber` integer NOT NULL,
	`text` text NOT NULL,
	CONSTRAINT `ayat_pk` PRIMARY KEY(`surahNumber`, `ayahNumber`)
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` integer PRIMARY KEY,
	`currentSurah` integer NOT NULL,
	`currentAyah` integer NOT NULL,
	`numberOfNewAyat` integer NOT NULL,
	`level` text DEFAULT 'beginner' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`taskId` integer PRIMARY KEY,
	`phase` text NOT NULL,
	`currentStep` integer,
	`repeatedCount` integer,
	`rate` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY,
	`repeatCount` integer DEFAULT 3 NOT NULL,
	`sakta` integer DEFAULT 2 NOT NULL,
	`reciter` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `surahs` (
	`surahNumber` integer PRIMARY KEY,
	`name` text NOT NULL,
	`ayahCount` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`surahNumber` integer NOT NULL,
	`ayatNumbers` text NOT NULL,
	`minimumAyatNumbers` text NOT NULL,
	`completedCount` integer DEFAULT 0 NOT NULL,
	`dueDate` integer NOT NULL,
	`status` text DEFAULT 'notStarted' NOT NULL,
	`type` text DEFAULT 'new' NOT NULL
);
