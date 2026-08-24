CREATE TABLE `account` (
  `updated_at` text,
  `user_id` text NOT NULL,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b420-75bf-ad56-ab93f2a163e5',
  `gender` text,
  `refresh_token_expires_at` text,
  `provider_id` text NOT NULL,
  `access_token_expires_at` text,
  `account_id` text NOT NULL,
  `refresh_token` text,
  `access_token` text,
  `password` text,
  `address` text,
  `id_token` text,
  `cover` text,
  `scope` text,
  `bio` text,
  CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `invitation` (
  `updated_at` text,
  `organization_id` text NOT NULL,
  `inviter_id` text NOT NULL,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b421-759b-880d-32dd19eb903b',
  `expires_at` text NOT NULL,
  `status` text NOT NULL,
  `email` text NOT NULL,
  `team_id` text,
  `role` text,
  CONSTRAINT `fk_invitation_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`),
  CONSTRAINT `fk_invitation_inviter_id_user_id_fk` FOREIGN KEY (`inviter_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `member` (
  `updated_at` text,
  `organization_id` text NOT NULL,
  `user_id` text NOT NULL,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b421-7597-bdd8-b5ba80a536b8',
  `role` text NOT NULL,
  CONSTRAINT `fk_member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`),
  CONSTRAINT `fk_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `organization` (
  `updated_at` text,
  `slug` text NOT NULL CONSTRAINT `organization_slug_unique_index` UNIQUE,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b421-7594-80d2-2f480df8f5e2',
  `name` text NOT NULL,
  `metadata` text,
  `logo` text
);

--> statement-breakpoint
CREATE TABLE `organization_role` (
  `updated_at` text,
  `organization_id` text NOT NULL,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b421-7599-942b-2d093d024406',
  `permission` text NOT NULL,
  `role` text NOT NULL,
  CONSTRAINT `fk_organization_role_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`)
);

--> statement-breakpoint
CREATE TABLE `session` (
  `updated_at` text,
  `user_id` text NOT NULL,
  `token` text NOT NULL CONSTRAINT `session_token_unique_index` UNIQUE,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b421-7593-a8d2-cf76ecff848b',
  `active_organization_id` text,
  `expires_at` text NOT NULL,
  `impersonated_by` text,
  `active_team_id` text,
  `ip_address` text,
  `user_agent` text,
  CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `team` (
  `updated_at` text,
  `organization_id` text NOT NULL,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b421-7598-9db1-a956cd2fefe5',
  `member_count` integer NOT NULL,
  `name` text NOT NULL,
  CONSTRAINT `fk_team_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`)
);

--> statement-breakpoint
CREATE TABLE `team_member` (
  `updated_at` text,
  `user_id` text NOT NULL,
  `team_id` text NOT NULL,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b421-7596-a92d-72463855a83d',
  `membership_key` text,
  CONSTRAINT `fk_team_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_team_member_team_id_team_id_fk` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`)
);

--> statement-breakpoint
CREATE TABLE `two_factor` (
  `updated_at` text,
  `user_id` text NOT NULL,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b421-7595-acca-e1cfae1e9755',
  `verified` integer NOT NULL,
  `failed_verification_count` integer NOT NULL,
  `backup_codes` text NOT NULL,
  `secret` text NOT NULL,
  `locked_until` text,
  CONSTRAINT `fk_two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `user` (
  `updated_at` text,
  `phone_number` text CONSTRAINT `user_phone_number_unique_index` UNIQUE,
  `email_verified` integer DEFAULT false,
  `created_at` text,
  `email` text NOT NULL CONSTRAINT `user_email_unique_index` UNIQUE,
  `username` text CONSTRAINT `user_username_unique_index` UNIQUE,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b420-75be-82e4-b9fe709df54b',
  `phone_number_verified` integer,
  `two_factor_enabled` integer,
  `is_anonymous` integer,
  `banned` integer,
  `display_username` text,
  `name` text NOT NULL,
  `ban_expires` text,
  `ban_reason` text,
  `image` text,
  `role` text
);

--> statement-breakpoint
CREATE TABLE `user_profile` (
  `updated_at` text,
  `user_id` text PRIMARY KEY,
  `phone_number` text CONSTRAINT `user_profile_phone_number_unique_index` UNIQUE,
  `created_at` text,
  `gender` text,
  `address` text,
  `cover` text,
  `bio` text,
  CONSTRAINT `fk_user_profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `verification` (
  `updated_at` text,
  `created_at` text,
  `id` text PRIMARY KEY DEFAULT '01a0d3c0-b421-759a-811a-b13ee163d4c5',
  `identifier` text NOT NULL,
  `expires_at` text NOT NULL,
  `value` text NOT NULL
);

--> statement-breakpoint
CREATE INDEX `account_user_id_index` ON `account` (`user_id`);

--> statement-breakpoint
CREATE INDEX `invitation_organization_id_index` ON `invitation` (`organization_id`);

--> statement-breakpoint
CREATE INDEX `invitation_inviter_id_index` ON `invitation` (`inviter_id`);

--> statement-breakpoint
CREATE INDEX `member_user_id_index` ON `member` (`user_id`);

--> statement-breakpoint
CREATE INDEX `member_organization_id_index` ON `member` (`organization_id`);

--> statement-breakpoint
CREATE INDEX `organization_role_organization_id_index` ON `organization_role` (`organization_id`);

--> statement-breakpoint
CREATE INDEX `session_user_id_index` ON `session` (`user_id`);

--> statement-breakpoint
CREATE INDEX `team_organization_id_index` ON `team` (`organization_id`);

--> statement-breakpoint
CREATE INDEX `team_member_user_id_index` ON `team_member` (`user_id`);

--> statement-breakpoint
CREATE INDEX `team_member_team_id_index` ON `team_member` (`team_id`);

--> statement-breakpoint
CREATE INDEX `two_factor_user_id_index` ON `two_factor` (`user_id`);

--> statement-breakpoint
CREATE INDEX `user_profile_user_id_index` ON `user_profile` (`user_id`);

--> statement-breakpoint
CREATE INDEX `verification_identifier_index` ON `verification` (`identifier`);
