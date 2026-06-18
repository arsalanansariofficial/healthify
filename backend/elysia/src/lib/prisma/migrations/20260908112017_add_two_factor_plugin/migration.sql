-- AlterTable
ALTER TABLE `User`
ADD COLUMN `twoFactorEnabled` BOOLEAN NULL;

-- CreateTable
CREATE TABLE `TwoFactor` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `backupCodes` TEXT NOT NULL,
  `verified` BOOLEAN NOT NULL,
  `secret` VARCHAR(191) NOT NULL,
  `failedVerificationCount` INTEGER NOT NULL,
  `lockedUntil` DATETIME (3) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TwoFactor` ADD CONSTRAINT `TwoFactor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
