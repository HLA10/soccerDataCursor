-- CreateTable
CREATE TABLE IF NOT EXISTS "competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "customType" TEXT,
    "season" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "logo" TEXT,
    "location" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "competitionTeam" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitionTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "competition_teamId_idx" ON "competition"("teamId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "competition_season_idx" ON "competition"("season");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "competitionTeam_competitionId_teamId_key" ON "competitionTeam"("competitionId", "teamId");

-- AddForeignKey
ALTER TABLE "competition" ADD CONSTRAINT IF NOT EXISTS "competition_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitionTeam" ADD CONSTRAINT IF NOT EXISTS "competitionTeam_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitionTeam" ADD CONSTRAINT IF NOT EXISTS "competitionTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddColumn (optional - for backward compatibility, games.competition remains as String)
-- ALTER TABLE "games" ADD COLUMN IF NOT EXISTS "competitionId" TEXT;

-- AddForeignKey (optional - if you want to link games to competition model)
-- ALTER TABLE "games" ADD CONSTRAINT IF NOT EXISTS "games_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

