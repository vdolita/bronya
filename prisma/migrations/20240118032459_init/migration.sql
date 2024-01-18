/*
  Warnings:

  - You are about to drop the column `expired_at` on the `session` table. All the data in the column will be lost.
  - Added the required column `expire_at` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "expired_at",
ADD COLUMN     "expire_at" TIMESTAMP(3) NOT NULL;
