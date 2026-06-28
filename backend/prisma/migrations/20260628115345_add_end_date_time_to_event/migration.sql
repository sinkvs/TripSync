/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_tripId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "endDateTime" TIMESTAMP(3);

-- DropTable
DROP TABLE "Message";
