/*
  Warnings:

  - You are about to drop the column `isNovel` on the `prefills` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prefills" DROP COLUMN "isNovel";

-- CreateTable
CREATE TABLE "banners" (
    "id" SERIAL NOT NULL,
    "imageURL" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonURL" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novelPrefills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chapter" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "novelPrefills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banners_name_key" ON "banners"("name");
