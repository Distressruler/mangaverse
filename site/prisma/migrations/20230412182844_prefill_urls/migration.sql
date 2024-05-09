/*
  Warnings:

  - You are about to drop the column `url` on the `prefills` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `prefills` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "MangaSite" ADD VALUE 'MangaBuddy';

-- AlterTable
ALTER TABLE "prefills" DROP COLUMN "url",
DROP COLUMN "website",
ADD COLUMN     "urls" TEXT[];
