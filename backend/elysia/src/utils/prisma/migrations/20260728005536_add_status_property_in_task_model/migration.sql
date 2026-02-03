/*
  Warnings:

  - Added the required column `status` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `task` ADD COLUMN `status` ENUM('complete', 'incomplete') NOT NULL;
