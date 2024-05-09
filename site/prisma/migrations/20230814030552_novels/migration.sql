-- CreateTable
CREATE TABLE "novels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coverURL" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastChapter" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "novels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novelChapters" (
    "id" SERIAL NOT NULL,
    "novel" TEXT NOT NULL,
    "number" DOUBLE PRECISION NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "lastRead" TIMESTAMP(3) NOT NULL,
    "released" TIMESTAMP(3) NOT NULL,
    "text" TEXT[],

    CONSTRAINT "novelChapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novelComments" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL,
    "upvotes" INTEGER NOT NULL,
    "manga" TEXT NOT NULL,
    "page" INTEGER NOT NULL,

    CONSTRAINT "novelComments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "novels_name_key" ON "novels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "novelChapters_novel_number_key" ON "novelChapters"("novel", "number");

-- AddForeignKey
ALTER TABLE "novelComments" ADD CONSTRAINT "novelComments_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "novelChapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
