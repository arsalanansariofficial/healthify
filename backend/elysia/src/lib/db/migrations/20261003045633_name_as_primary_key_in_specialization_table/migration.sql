ALTER TABLE `doctor_to_specialization`
RENAME COLUMN `specialization_id` TO `specialization`;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_specialization` (
  `name` text PRIMARY KEY,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL
);

--> statement-breakpoint
INSERT INTO
  `__new_specialization` (`name`, `updated_at`, `created_at`)
SELECT
  `name`,
  `updated_at`,
  `created_at`
FROM
  `specialization`;

--> statement-breakpoint
DROP TABLE `specialization`;

--> statement-breakpoint
ALTER TABLE `__new_specialization`
RENAME TO `specialization`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_doctor_to_specialization` (
  `specialization` text NOT NULL,
  `doctor_id` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_at` text NOT NULL,
  CONSTRAINT `doctor_to_specialization_pk` PRIMARY KEY (`doctor_id`, `specialization`),
  CONSTRAINT `fk_doctor_to_specialization_specialization_specialization_name_fk` FOREIGN KEY (`specialization`) REFERENCES `specialization` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_doctor_to_specialization_doctor_id_doctor_user_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`user_id`) ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO
  `__new_doctor_to_specialization` (
    `specialization`,
    `doctor_id`,
    `updated_at`,
    `created_at`
  )
SELECT
  `specialization`,
  `doctor_id`,
  `updated_at`,
  `created_at`
FROM
  `doctor_to_specialization`;

--> statement-breakpoint
DROP TABLE `doctor_to_specialization`;

--> statement-breakpoint
ALTER TABLE `__new_doctor_to_specialization`
RENAME TO `doctor_to_specialization`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;
