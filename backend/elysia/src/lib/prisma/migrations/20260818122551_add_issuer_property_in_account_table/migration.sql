/*
Warnings:

- You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.
- A unique constraint covering the columns `[issuer,accountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
- Added the required column `issuer` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Token`
DROP FOREIGN KEY `Token_userId_fkey`;

-- AlterTable
ALTER TABLE `Account`
ADD COLUMN `issuer` VARCHAR(191) NOT NULL,
MODIFY `accountId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Token`;

-- CreateIndex
CREATE UNIQUE INDEX `Account_issuer_accountId_key` ON `Account` (`issuer`, `accountId`);
