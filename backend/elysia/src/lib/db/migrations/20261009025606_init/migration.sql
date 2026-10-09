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
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
CREATE TABLE `appointment` (
  `doctor_id` text NOT NULL,
  `patient_id` text NOT NULL,
  `priority` text DEFAULT 'normal' NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `queue` integer NOT NULL,
  `from` text NOT NULL,
  `date` text NOT NULL,
  `to` text NOT NULL,
  `prescription` text,
  `rating` integer,
  `feedback` text,
  `notes` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_appointment_doctor_id_doctor_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointment_patient_id_user_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ux_appointment_doctor_id_patient_id_date_from_to` UNIQUE (`doctor_id`, `patient_id`, `date`, `from`, `to`),
  CONSTRAINT "chk_appointment_valid_rating" CHECK ("rating" between 1 and 5),
  CONSTRAINT "chk_appointment_valid_time" CHECK ("from" < "to")
);

--> statement-breakpoint
CREATE TABLE `doctor` (
  `user_id` text PRIMARY KEY,
  `experience_years` integer DEFAULT 0 NOT NULL,
  `consultation_fee` integer DEFAULT 0 NOT NULL,
  `rating` integer DEFAULT 0 NOT NULL,
  `license_number` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  CONSTRAINT `fk_doctor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
CREATE TABLE `doctor_to_specialization` (
  `specialization` text NOT NULL,
  `doctor_id` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  CONSTRAINT `doctor_to_specialization_pk` PRIMARY KEY (`doctor_id`, `specialization`),
  CONSTRAINT `fk_doctor_to_specialization_specialization_specialization_name_fk` FOREIGN KEY (`specialization`) REFERENCES `specialization` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_doctor_to_specialization_doctor_id_doctor_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`user_id`) ON DELETE CASCADE
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
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_invitation_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invitation_inviter_id_user_id_fk` FOREIGN KEY (`inviter_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
CREATE TABLE `member` (
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
CREATE TABLE `organization` (
  `slug` text NOT NULL CONSTRAINT `ux_organization_slug` UNIQUE,
  `name` text NOT NULL,
  `metadata` text,
  `logo` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY
);

--> statement-breakpoint
CREATE TABLE `organization_role` (
  `organization_id` text NOT NULL,
  `permission` text NOT NULL,
  `role` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_organization_role_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE
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
CREATE TABLE `session` (
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
CREATE TABLE `specialization` (
  `name` text PRIMARY KEY,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL
);

--> statement-breakpoint
CREATE TABLE `team` (
  `organization_id` text NOT NULL,
  `member_count` integer NOT NULL,
  `name` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_team_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
CREATE TABLE `team_member` (
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
CREATE TABLE `two_factor` (
  `user_id` text NOT NULL,
  `verified` integer DEFAULT true,
  `failed_verification_count` integer DEFAULT 0,
  `backup_codes` text NOT NULL,
  `secret` text NOT NULL,
  `locked_until` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

--> statement-breakpoint
CREATE TABLE `user` (
  `email_verified` integer DEFAULT false NOT NULL,
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
CREATE TABLE `user_profile` (
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
CREATE TABLE `verification` (
  `identifier` text NOT NULL,
  `expires_at` text NOT NULL,
  `value` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY
);

--> statement-breakpoint
CREATE INDEX `fk_account_user_id` ON `account` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_appointment_patient_id` ON `appointment` (`patient_id`);

--> statement-breakpoint
CREATE INDEX `fk_appointment_doctor_id` ON `appointment` (`doctor_id`);

--> statement-breakpoint
CREATE INDEX `fk_doctor_user_id` ON `doctor` (`user_id`);

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
CREATE INDEX `idx_schedule_doctor_id` ON `schedule` (`doctor_id`);

--> statement-breakpoint
CREATE INDEX `fk_session_user_id` ON `session` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_team_organization_id` ON `team` (`organization_id`);

--> statement-breakpoint
CREATE INDEX `fk_team_member_user_id` ON `team_member` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_team_member_team_id` ON `team_member` (`team_id`);

--> statement-breakpoint
CREATE INDEX `fk_two_factor_user_id` ON `two_factor` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_user_profile_user_id` ON `user_profile` (`user_id`);

--> statement-breakpoint
CREATE INDEX `idx_verification_identifier` ON `verification` (`identifier`);
