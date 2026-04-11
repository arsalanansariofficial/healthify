/*
Warnings:

- You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
- You are about to drop the column `verifiedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User`
DROP COLUMN `password`,
DROP COLUMN `verifiedAt`,
ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN `image` TEXT NULL,
MODIFY `name` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Account` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `accountId` TEXT NOT NULL,
  `providerId` TEXT NOT NULL,
  `idToken` TEXT NULL,
  `scope` TEXT NULL,
  `password` TEXT NULL,
  `accessToken` TEXT NULL,
  `refreshToken` TEXT NULL,
  `accessTokenExpiresAt` DATETIME (3) NULL,
  `refreshTokenExpiresAt` DATETIME (3) NULL,
  `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME (3) NOT NULL,
  INDEX `Account_userId_idx` (`userId` (191)),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME (3) NOT NULL,
  `ipAddress` TEXT NULL,
  `userAgent` TEXT NULL,
  `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME (3) NOT NULL,
  INDEX `Session_userId_idx` (`userId` (191)),
  UNIQUE INDEX `Session_token_key` (`token`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Verification` (
  `id` VARCHAR(191) NOT NULL,
  `identifier` TEXT NOT NULL,
  `value` TEXT NOT NULL,
  `expiresAt` DATETIME (3) NOT NULL,
  `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME (3) NOT NULL,
  INDEX `Verification_identifier_idx` (`identifier` (191)),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
