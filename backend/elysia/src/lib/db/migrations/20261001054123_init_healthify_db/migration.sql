CREATE TABLE `appointment` (
  `doctor_id` text NOT NULL,
  `priority` text NOT NULL,
  `patient_id` text NOT NULL,
  `queue` integer NOT NULL,
  `from` text NOT NULL,
  `date` text NOT NULL,
  `to` text NOT NULL,
  `presription` text,
  `rating` integer,
  `notes` text,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_appointment_doctor_id_doctor_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointment_patient_id_user_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT "chk_appointment_valid_rating" CHECK ("rating" between 1 and 5),
  CONSTRAINT "chk_appointment_valid_time" CHECK ("from" < "to")
);

--> statement-breakpoint
CREATE TABLE `doctor` (
  `user_id` text PRIMARY KEY,
  `experience_years` integer NOT NULL,
  `consultation_fee` integer NOT NULL,
  `license_number` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  CONSTRAINT `fk_doctor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
CREATE TABLE `doctor_to_specialization` (
  `specialization_id` text NOT NULL,
  `doctor_id` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  CONSTRAINT `doctor_to_specialization_pk` PRIMARY KEY (`doctor_id`, `specialization_id`),
  CONSTRAINT `fk_doctor_to_specialization_specialization_id_specialization_id_fk` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_doctor_to_specialization_doctor_id_doctor_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`user_id`) ON DELETE CASCADE
);

--> statement-breakpoint
CREATE TABLE `schedule` (
  `doctor_id` text NOT NULL,
  `day` text NOT NULL,
  `from` text NOT NULL,
  `to` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  CONSTRAINT `fk_schedule_doctor_id_doctor_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`user_id`) ON DELETE CASCADE
);

--> statement-breakpoint
CREATE TABLE `specialization` (
  `name` text NOT NULL CONSTRAINT `ux_specialization_name` UNIQUE,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY
);

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_organization` (
  `slug` text NOT NULL CONSTRAINT `ux_organization_slug` UNIQUE,
  `name` text NOT NULL,
  `metadata` text,
  `logo` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY
);

--> statement-breakpoint
INSERT INTO
  `__new_organization` (
    `slug`,
    `name`,
    `metadata`,
    `logo`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `slug`,
  `name`,
  `metadata`,
  `logo`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `organization`;

--> statement-breakpoint
DROP TABLE `organization`;

--> statement-breakpoint
ALTER TABLE `__new_organization`
RENAME TO `organization`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_session` (
  `user_id` text NOT NULL,
  `token` text NOT NULL CONSTRAINT `ux_session_token` UNIQUE,
  `active_organization_id` text,
  `expires_at` text NOT NULL,
  `impersonated_by` text,
  `active_team_id` text,
  `ip_address` text,
  `user_agent` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_session` (
    `user_id`,
    `token`,
    `active_organization_id`,
    `expires_at`,
    `impersonated_by`,
    `active_team_id`,
    `ip_address`,
    `user_agent`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `user_id`,
  `token`,
  `active_organization_id`,
  `expires_at`,
  `impersonated_by`,
  `active_team_id`,
  `ip_address`,
  `user_agent`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `session`;

--> statement-breakpoint
DROP TABLE `session`;

--> statement-breakpoint
ALTER TABLE `__new_session`
RENAME TO `session`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_user` (
  `email_verified` integer NOT NULL,
  `phone_number` text CONSTRAINT `ux_user_phone_number` UNIQUE,
  `phone_number_verified` integer,
  `email` text NOT NULL CONSTRAINT `ux_user_email` UNIQUE,
  `two_factor_enabled` integer,
  `username` text CONSTRAINT `ux_user_username` UNIQUE,
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
  `id` text PRIMARY KEY
);

--> statement-breakpoint
INSERT INTO
  `__new_user` (
    `email_verified`,
    `phone_number`,
    `email`,
    `username`,
    `phone_number_verified`,
    `two_factor_enabled`,
    `is_anonymous`,
    `banned`,
    `display_username`,
    `name`,
    `ban_reason`,
    `ban_expires`,
    `image`,
    `role`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `email_verified`,
  `phone_number`,
  `email`,
  `username`,
  `phone_number_verified`,
  `two_factor_enabled`,
  `is_anonymous`,
  `banned`,
  `display_username`,
  `name`,
  `ban_reason`,
  `ban_expires`,
  `image`,
  `role`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `user`;

--> statement-breakpoint
DROP TABLE `user`;

--> statement-breakpoint
ALTER TABLE `__new_user`
RENAME TO `user`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_user_profile` (
  `user_id` text PRIMARY KEY,
  `phone_number` text CONSTRAINT `ux_user_profile_phone_number` UNIQUE,
  `gender` text,
  `address` text,
  `cover` text,
  `bio` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  CONSTRAINT `fk_user_profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_user_profile` (
    `user_id`,
    `phone_number`,
    `gender`,
    `address`,
    `cover`,
    `bio`,
    `updated_at`,
    `created_at`
  )
SELECT
  `user_id`,
  `phone_number`,
  `gender`,
  `address`,
  `cover`,
  `bio`,
  `updated_at`,
  `created_at`
FROM
  `user_profile`;

--> statement-breakpoint
DROP TABLE `user_profile`;

--> statement-breakpoint
ALTER TABLE `__new_user_profile`
RENAME TO `user_profile`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_account` (
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
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_account` (
    `user_id`,
    `gender`,
    `refresh_token_expires_at`,
    `provider_id`,
    `access_token_expires_at`,
    `account_id`,
    `refresh_token`,
    `access_token`,
    `password`,
    `address`,
    `id_token`,
    `cover`,
    `scope`,
    `bio`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `user_id`,
  `gender`,
  `refresh_token_expires_at`,
  `provider_id`,
  `access_token_expires_at`,
  `account_id`,
  `refresh_token`,
  `access_token`,
  `password`,
  `address`,
  `id_token`,
  `cover`,
  `scope`,
  `bio`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `account`;

--> statement-breakpoint
DROP TABLE `account`;

--> statement-breakpoint
ALTER TABLE `__new_account`
RENAME TO `account`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_invitation` (
  `organization_id` text NOT NULL,
  `inviter_id` text NOT NULL,
  `expires_at` text NOT NULL,
  `status` text NOT NULL,
  `email` text NOT NULL,
  `team_id` text,
  `role` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_invitation_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invitation_inviter_id_user_id_fk` FOREIGN KEY (`inviter_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_invitation` (
    `organization_id`,
    `inviter_id`,
    `expires_at`,
    `status`,
    `email`,
    `team_id`,
    `role`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `organization_id`,
  `inviter_id`,
  `expires_at`,
  `status`,
  `email`,
  `team_id`,
  `role`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `invitation`;

--> statement-breakpoint
DROP TABLE `invitation`;

--> statement-breakpoint
ALTER TABLE `__new_invitation`
RENAME TO `invitation`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_member` (
  `organization_id` text NOT NULL,
  `user_id` text NOT NULL,
  `role` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_member` (
    `organization_id`,
    `user_id`,
    `role`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `organization_id`,
  `user_id`,
  `role`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `member`;

--> statement-breakpoint
DROP TABLE `member`;

--> statement-breakpoint
ALTER TABLE `__new_member`
RENAME TO `member`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_organization_role` (
  `organization_id` text NOT NULL,
  `permission` text NOT NULL,
  `role` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_organization_role_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_organization_role` (
    `organization_id`,
    `permission`,
    `role`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `organization_id`,
  `permission`,
  `role`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `organization_role`;

--> statement-breakpoint
DROP TABLE `organization_role`;

--> statement-breakpoint
ALTER TABLE `__new_organization_role`
RENAME TO `organization_role`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_team` (
  `organization_id` text NOT NULL,
  `member_count` integer NOT NULL,
  `name` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_team_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_team` (
    `organization_id`,
    `member_count`,
    `name`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `organization_id`,
  `member_count`,
  `name`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `team`;

--> statement-breakpoint
DROP TABLE `team`;

--> statement-breakpoint
ALTER TABLE `__new_team`
RENAME TO `team`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_team_member` (
  `user_id` text NOT NULL,
  `team_id` text NOT NULL,
  `membership_key` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_team_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_team_member_team_id_team_id_fk` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_team_member` (
    `user_id`,
    `team_id`,
    `membership_key`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `user_id`,
  `team_id`,
  `membership_key`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `team_member`;

--> statement-breakpoint
DROP TABLE `team_member`;

--> statement-breakpoint
ALTER TABLE `__new_team_member`
RENAME TO `team_member`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_two_factor` (
  `user_id` text NOT NULL,
  `verified` integer,
  `failed_verification_count` integer,
  `backup_codes` text NOT NULL,
  `secret` text NOT NULL,
  `locked_until` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_two_factor` (
    `user_id`,
    `verified`,
    `failed_verification_count`,
    `backup_codes`,
    `secret`,
    `locked_until`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `user_id`,
  `verified`,
  `failed_verification_count`,
  `backup_codes`,
  `secret`,
  `locked_until`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `two_factor`;

--> statement-breakpoint
DROP TABLE `two_factor`;

--> statement-breakpoint
ALTER TABLE `__new_two_factor`
RENAME TO `two_factor`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_verification` (
  `identifier` text NOT NULL,
  `expires_at` text NOT NULL,
  `value` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY
);

--> statement-breakpoint
INSERT INTO
  `__new_verification` (
    `identifier`,
    `expires_at`,
    `value`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `identifier`,
  `expires_at`,
  `value`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `verification`;

--> statement-breakpoint
DROP TABLE `verification`;

--> statement-breakpoint
ALTER TABLE `__new_verification`
RENAME TO `verification`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
DROP INDEX IF EXISTS `account_user_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `invitation_organization_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `invitation_inviter_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `member_user_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `member_organization_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `organization_role_organization_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `session_user_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `team_organization_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `team_member_user_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `team_member_team_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `two_factor_user_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `user_profile_user_id_index`;

--> statement-breakpoint
DROP INDEX IF EXISTS `verification_identifier_index`;

--> statement-breakpoint
CREATE INDEX `fk_session_user_id` ON `session` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_user_profile_user_id` ON `user_profile` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_account_user_id` ON `account` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_invitation_organization_id` ON `invitation` (`organization_id`);

--> statement-breakpoint
CREATE INDEX `fk_invitation_inviter_id` ON `invitation` (`inviter_id`);

--> statement-breakpoint
CREATE INDEX `fk_member_user_id` ON `member` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_member_organization_id` ON `member` (`organization_id`);

--> statement-breakpoint
CREATE INDEX `fk_organization_role_organization_id` ON `organization_role` (`organization_id`);

--> statement-breakpoint
CREATE INDEX `fk_team_organization_id` ON `team` (`organization_id`);

--> statement-breakpoint
CREATE INDEX `fk_team_member_user_id` ON `team_member` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_team_member_team_id` ON `team_member` (`team_id`);

--> statement-breakpoint
CREATE INDEX `fk_two_factor_user_id` ON `two_factor` (`user_id`);

--> statement-breakpoint
CREATE INDEX `idx_verification_identifier` ON `verification` (`identifier`);

--> statement-breakpoint
CREATE INDEX `ux_appointment_doctor_id_patient_id_date_from_to` ON `appointment` (`doctor_id`, `patient_id`, `date`, `from`);

--> statement-breakpoint
CREATE INDEX `fk_appointment_patient_id` ON `appointment` (`patient_id`);

--> statement-breakpoint
CREATE INDEX `fk_appointment_doctor_id` ON `appointment` (`doctor_id`);

--> statement-breakpoint
CREATE INDEX `fk_doctor_user_id` ON `doctor` (`user_id`);

--> statement-breakpoint
CREATE INDEX `idx_schedule_doctor_id` ON `schedule` (`doctor_id`);
