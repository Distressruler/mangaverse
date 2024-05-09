-- CreateTable
CREATE TABLE "subscribers" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "manga" TEXT NOT NULL,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_userId_manga_key" ON "subscribers"("userId", "manga");
