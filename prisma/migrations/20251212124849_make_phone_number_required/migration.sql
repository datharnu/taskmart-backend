/*
  Warnings:

  - Made the column `phoneNumber` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- Update existing users with a placeholder phone number
UPDATE "users" SET "phoneNumber" = '+0000000000' WHERE "phoneNumber" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET NOT NULL;
