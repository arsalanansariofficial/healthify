ALTER TABLE `appointment`
RENAME COLUMN `presription` TO `prescription`;

--> statement-breakpoint
ALTER TABLE `appointment` ADD `updated_at` text NOT NULL;

--> statement-breakpoint
ALTER TABLE `appointment` ADD `created_at` text NOT NULL;
