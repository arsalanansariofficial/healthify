ALTER TABLE `appointment` ADD `status` text DEFAULT 'pending' NOT NULL;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_appointment` (
  `doctor_id` text NOT NULL,
  `priority` text NOT NULL,
  `patient_id` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `queue` integer NOT NULL,
  `from` text NOT NULL,
  `date` text NOT NULL,
  `to` text NOT NULL,
  `prescription` text,
  `rating` integer,
  `notes` text,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  `id` text PRIMARY KEY,
  CONSTRAINT `fk_appointment_doctor_id_doctor_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointment_patient_id_user_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ux_appointment_doctor_id_patient_id_date_from_to` UNIQUE (`doctor_id`, `patient_id`, `date`, `from`),
  CONSTRAINT "chk_appointment_valid_rating" CHECK ("rating" between 1 and 5),
  CONSTRAINT "chk_appointment_valid_time" CHECK ("from" < "to")
);

--> statement-breakpoint
INSERT INTO
  `__new_appointment` (
    `doctor_id`,
    `priority`,
    `patient_id`,
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
DROP INDEX IF EXISTS `ux_appointment_doctor_id_patient_id_date_from_to`;

--> statement-breakpoint
CREATE INDEX `fk_appointment_patient_id` ON `appointment` (`patient_id`);

--> statement-breakpoint
CREATE INDEX `fk_appointment_doctor_id` ON `appointment` (`doctor_id`);
