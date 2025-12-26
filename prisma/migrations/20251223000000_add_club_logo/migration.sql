-- CreateTable
CREATE TABLE IF NOT EXISTS "clubLogo" (
    "id" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubLogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "clubLogo_clubName_key" ON "clubLogo"("clubName");


