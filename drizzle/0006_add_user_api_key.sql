-- Add manusApiKey and apiKeyUpdatedAt fields to users table for per-user credit usage
ALTER TABLE `users` ADD `manusApiKey` text;--> statement-breakpoint
ALTER TABLE `users` ADD `apiKeyUpdatedAt` timestamp;
