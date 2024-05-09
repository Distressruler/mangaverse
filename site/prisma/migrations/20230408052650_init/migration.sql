-- CreateEnum
CREATE TYPE "MangaSite" AS ENUM ('MangaTx', 'ManhuaPlus');

-- CreateTable
CREATE TABLE "mangas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coverURL" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "addedAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL,
    "lastChapter" INTEGER NOT NULL,

    CONSTRAINT "mangas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" SERIAL NOT NULL,
    "manga" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "lastRead" INTEGER NOT NULL,
    "released" INTEGER NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "editedAt" INTEGER NOT NULL,
    "upvotes" INTEGER NOT NULL,
    "manga" TEXT NOT NULL,
    "page" INTEGER NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "urls" TEXT[],

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masks" (
    "name" TEXT NOT NULL,
    "fake" TEXT NOT NULL,

    CONSTRAINT "masks_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "prefills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" "MangaSite" NOT NULL,
    "chapter" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "prefills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mangas_name_key" ON "mangas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_manga_number_key" ON "chapters"("manga", "number");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
