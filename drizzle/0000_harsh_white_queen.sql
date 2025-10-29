CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentType` enum('inbox','planning','qa','expert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`relatedItemId` varchar(64),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `githubSync` (
	`id` int AUTO_INCREMENT NOT NULL,
	`syncType` varchar(64) NOT NULL,
	`status` enum('success','failed','in-progress') NOT NULL,
	`itemCount` int DEFAULT 0,
	`error` text,
	`metadata` json,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	CONSTRAINT `githubSync_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pmItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` varchar(64) NOT NULL,
	`type` enum('IDEA','FEAT','BUG','IMPROVE','TECH') NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`status` enum('inbox','backlog','planned','in-progress','completed','on-hold','archived') NOT NULL,
	`tags` json,
	`related` json,
	`githubPath` varchar(500),
	`metadata` json,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `pmItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `pmItems_itemId_unique` UNIQUE(`itemId`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`defaultAgent` enum('inbox','planning','qa','expert') DEFAULT 'inbox',
	`uiSettings` json,
	`notificationSettings` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
