CREATE TABLE `account` (
  `user_id` text NOT NULL,
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
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4',
  CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `invitation` (
  `organization_id` text NOT NULL,
  `inviter_id` text NOT NULL,
  `expires_at` text NOT NULL,
  `status` text NOT NULL,
  `email` text NOT NULL,
  `team_id` text,
  `role` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4',
  CONSTRAINT `fk_invitation_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`),
  CONSTRAINT `fk_invitation_inviter_id_user_id_fk` FOREIGN KEY (`inviter_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `member` (
  `organization_id` text NOT NULL,
  `user_id` text NOT NULL,
  `role` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4',
  CONSTRAINT `fk_member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`),
  CONSTRAINT `fk_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `organization` (
  `slug` text NOT NULL CONSTRAINT `organization_slug_unique_index` UNIQUE,
  `name` text NOT NULL,
  `metadata` text,
  `logo` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4'
);

--> statement-breakpoint
CREATE TABLE `organization_role` (
  `organization_id` text NOT NULL,
  `permission` text NOT NULL,
  `role` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4',
  CONSTRAINT `fk_organization_role_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`)
);

--> statement-breakpoint
CREATE TABLE `session` (
  `user_id` text NOT NULL,
  `token` text NOT NULL CONSTRAINT `session_token_unique_index` UNIQUE,
  `active_organization_id` text,
  `expires_at` text NOT NULL,
  `impersonated_by` text,
  `active_team_id` text,
  `ip_address` text,
  `user_agent` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4',
  CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `team` (
  `organization_id` text NOT NULL,
  `member_count` integer NOT NULL,
  `name` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4',
  CONSTRAINT `fk_team_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`)
);

--> statement-breakpoint
CREATE TABLE `team_member` (
  `user_id` text NOT NULL,
  `team_id` text NOT NULL,
  `membership_key` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4',
  CONSTRAINT `fk_team_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_team_member_team_id_team_id_fk` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`)
);

--> statement-breakpoint
CREATE TABLE `two_factor` (
  `user_id` text NOT NULL,
  `verified` integer DEFAULT true,
  `failed_verification_count` integer DEFAULT 0,
  `backup_codes` text NOT NULL,
  `secret` text NOT NULL,
  `locked_until` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4',
  CONSTRAINT `fk_two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `user` (
  `email_verified` integer DEFAULT false NOT NULL,
  `phone_number` text CONSTRAINT `user_phone_number_unique_index` UNIQUE,
  `email` text NOT NULL CONSTRAINT `user_email_unique_index` UNIQUE,
  `username` text CONSTRAINT `user_username_unique_index` UNIQUE,
  `phone_number_verified` integer,
  `two_factor_enabled` integer,
  `is_anonymous` integer,
  `banned` integer,
  `display_username` text,
  `name` text NOT NULL,
  `ban_reason` text,
  `ban_expires` text,
  `image` text,
  `role` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4'
);

--> statement-breakpoint
CREATE TABLE `user_profile` (
  `user_id` text PRIMARY KEY,
  `phone_number` text CONSTRAINT `user_profile_phone_number_unique_index` UNIQUE,
  `gender` text,
  `address` text,
  `cover` text,
  `bio` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  CONSTRAINT `fk_user_profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

--> statement-breakpoint
CREATE TABLE `verification` (
  `identifier` text NOT NULL,
  `expires_at` text NOT NULL,
  `value` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY DEFAULT '01a0de45-0440-7241-8e38-4856d008c1c4'
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
