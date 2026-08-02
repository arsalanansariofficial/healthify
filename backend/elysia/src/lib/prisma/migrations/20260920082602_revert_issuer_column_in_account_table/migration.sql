/*
Warnings:

- You are about to drop the column `issuer` on the `Account` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Account_issuer_accountId_key` ON `Account`;

-- AlterTable
ALTER TABLE `Account`
DROP COLUMN `issuer`;
