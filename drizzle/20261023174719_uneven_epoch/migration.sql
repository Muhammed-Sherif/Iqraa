CREATE TABLE `downloads` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`reciter` text NOT NULL,
	`surahNumber` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`downloadedCount` integer DEFAULT 0 NOT NULL,
	`totalCount` integer DEFAULT 0 NOT NULL,
	`localPath` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
