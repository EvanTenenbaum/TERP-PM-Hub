CREATE TABLE `implementationQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pmItemId` varchar(64) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`diagnosis` text NOT NULL,
	`priority` enum('critical','high','medium','low') NOT NULL,
	`estimatedMinutes` int NOT NULL,
	`dependencies` json DEFAULT ('[]'),
	`qaRequirements` text NOT NULL,
	`implementationSteps` json NOT NULL,
	`status` enum('queued','in-progress','completed','blocked') NOT NULL DEFAULT 'queued',
	`queueOrder` int DEFAULT 0,
	`assignedTo` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `implementationQueue_id` PRIMARY KEY(`id`)
);
