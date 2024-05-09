/*
  Warnings:

  - The primary key for the `reading` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `reading` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,manga]` on the table `reading` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `reading` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "reading_id_manga_key";

-- AlterTable
ALTER TABLE "reading" DROP CONSTRAINT "reading_pkey",
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "reading_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "reading_userId_manga_key" ON "reading"("userId", "manga");
