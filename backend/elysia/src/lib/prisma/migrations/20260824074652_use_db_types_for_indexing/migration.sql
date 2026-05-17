-- DropIndex
DROP INDEX `Verification_identifier_idx` ON `Verification`;

-- AlterTable
ALTER TABLE `Account` MODIFY `providerId` TEXT NOT NULL,
MODIFY `idToken` TEXT NULL,
MODIFY `scope` TEXT NULL,
MODIFY `password` TEXT NULL,
MODIFY `accessToken` TEXT NULL,
MODIFY `refreshToken` TEXT NULL;

-- AlterTable
ALTER TABLE `Session` MODIFY `ipAddress` TEXT NULL,
MODIFY `userAgent` TEXT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `name` TEXT NOT NULL,
MODIFY `image` TEXT NULL;

-- AlterTable
ALTER TABLE `Verification` MODIFY `identifier` TEXT NOT NULL,
MODIFY `value` TEXT NOT NULL;

-- CreateIndex
CREATE INDEX `Verification_identifier_idx` ON `Verification` (`identifier` (191));
