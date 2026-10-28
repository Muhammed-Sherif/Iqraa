ALTER TABLE `progress` ADD `direction` text DEFAULT 'asc' NOT NULL;--> statement-breakpoint
ALTER TABLE `progress` ADD `userType` text DEFAULT 'NotHafiz' NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `audioUri` text;