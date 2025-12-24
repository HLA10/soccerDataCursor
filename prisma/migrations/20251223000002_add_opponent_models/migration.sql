-- CreateTable
CREATE TABLE IF NOT EXISTS "opponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "homeField" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "opponentTeam" (
    "id" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "teamId" TEXT,
    "name" TEXT,
    "gender" TEXT,
    "age" TEXT,
    "teamColor" TEXT,
    "homeField" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opponentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "scoutedPlayer" (
    "id" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gameId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- AlterTable
ALTER TABLE "games" ADD COLUMN IF NOT EXISTS "opponentId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "scoutedPlayer_opponentId_idx" ON "scoutedPlayer"("opponentId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "opponentTeam_opponentId_teamId_key" ON "opponentTeam"("opponentId", "teamId");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT IF NOT EXISTS "games_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "opponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opponentTeam" ADD CONSTRAINT IF NOT EXISTS "opponentTeam_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "opponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opponentTeam" ADD CONSTRAINT IF NOT EXISTS "opponentTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoutedPlayer" ADD CONSTRAINT IF NOT EXISTS "scoutedPlayer_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "opponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

