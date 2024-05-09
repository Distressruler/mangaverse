/*
  Warnings:

  - Changed the type of `lastRead` on the `chapters` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `released` on the `chapters` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createdAt` on the `comments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `editedAt` on the `comments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `addedAt` on the `mangas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `mangas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "chapters" DROP COLUMN "lastRead",
ADD COLUMN     "lastRead" TIMESTAMP(3) NOT NULL,
DROP COLUMN "released",
ADD COLUMN     "released" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "editedAt",
ADD COLUMN     "editedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "mangas" DROP COLUMN "addedAt",
ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
