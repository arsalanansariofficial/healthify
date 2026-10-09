ALTER TABLE `appointment` ADD `feedback` text;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_appointment` (
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
INSERT INTO
  `__new_appointment` (
    `doctor_id`,
    `priority`,
    `patient_id`,
    `status`,
    `queue`,
    `from`,
    `date`,
    `to`,
    `prescription`,
    `rating`,
    `notes`,
    `updated_at`,
    `created_at`,
    `id`
  )
SELECT
  `doctor_id`,
  `priority`,
  `patient_id`,
  `status`,
  `queue`,
  `from`,
  `date`,
  `to`,
  `prescription`,
  `rating`,
  `notes`,
  `updated_at`,
  `created_at`,
  `id`
FROM
  `appointment`;

--> statement-breakpoint
DROP TABLE `appointment`;

--> statement-breakpoint
ALTER TABLE `__new_appointment`
RENAME TO `appointment`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_doctor` (
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
INSERT INTO
  `__new_doctor` (
    `user_id`,
    `experience_years`,
    `consultation_fee`,
    `rating`,
    `license_number`,
    `updated_at`,
    `created_at`
  )
SELECT
  `user_id`,
  `experience_years`,
  `consultation_fee`,
  `rating`,
  `license_number`,
  `updated_at`,
  `created_at`
FROM
  `doctor`;

--> statement-breakpoint
DROP TABLE `doctor`;

--> statement-breakpoint
ALTER TABLE `__new_doctor`
RENAME TO `doctor`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_two_factor` (
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
CREATE TABLE `__new_user` (
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
INSERT INTO
  `__new_user` (
    `email_verified`,
    `phone_number`,
    `phone_number_verified`,
    `email`,
    `two_factor_enabled`,
    `username`,
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
  `phone_number_verified`,
  `email`,
  `two_factor_enabled`,
  `username`,
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
CREATE INDEX `fk_appointment_patient_id` ON `appointment` (`patient_id`);

--> statement-breakpoint
CREATE INDEX `fk_appointment_doctor_id` ON `appointment` (`doctor_id`);

--> statement-breakpoint
CREATE INDEX `fk_doctor_user_id` ON `doctor` (`user_id`);

--> statement-breakpoint
CREATE INDEX `fk_two_factor_user_id` ON `two_factor` (`user_id`);
