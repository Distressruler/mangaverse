-- CreateTable
CREATE TABLE "reading" (
    "id" TEXT NOT NULL,
    "manga" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,

    CONSTRAINT "reading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reading_id_manga_key" ON "reading"("id", "manga");
