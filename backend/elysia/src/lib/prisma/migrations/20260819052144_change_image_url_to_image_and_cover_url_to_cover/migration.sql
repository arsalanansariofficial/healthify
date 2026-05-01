/*
Warnings:

- You are about to drop the column `coverUrl` on the `UserProfile` table. All the data in the column will be lost.
- You are about to drop the column `imageUrl` on the `UserProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Verification_identifier_idx` ON `Verification`;

-- AlterTable
ALTER TABLE `UserProfile`
DROP COLUMN `coverUrl`,
DROP COLUMN `imageUrl`,
ADD COLUMN `cover` VARCHAR(191) NULL,
ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Verification` MODIFY `identifier` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Verification_identifier_idx` ON `Verification` (`identifier`);
