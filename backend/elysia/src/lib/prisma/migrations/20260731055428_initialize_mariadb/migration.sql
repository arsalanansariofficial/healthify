-- CreateTable
CREATE TABLE `UserProfile` (
  `phoneNumber` VARCHAR(191) NULL,
  `userId` VARCHAR(191) NOT NULL,
  `imageUrl` VARCHAR(191) NULL,
  `coverUrl` VARCHAR(191) NULL,
  `bio` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `gender` ENUM ('male', 'female') NULL,
  `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME (3) NOT NULL,
  UNIQUE INDEX `UserProfile_phoneNumber_key` (`phoneNumber`),
  PRIMARY KEY (`userId`)
) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `verifiedAt` DATETIME (3) NULL,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME (3) NOT NULL,
  UNIQUE INDEX `User_email_key` (`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Token` (
  `token` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME (3) NOT NULL,
  UNIQUE INDEX `Token_token_key` (`token`)
) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
  `id` VARCHAR(191) NOT NULL,
  `status` ENUM ('complete', 'incomplete') NOT NULL,
  `description` VARCHAR(191) NULL,
  `title` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME (3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
