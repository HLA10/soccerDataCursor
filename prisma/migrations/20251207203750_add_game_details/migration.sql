-- AlterTable
ALTER TABLE "game_stats" ADD COLUMN     "assistMinutes" TEXT,
ADD COLUMN     "goalMinutes" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "started" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "substitutedBy" TEXT,
ADD COLUMN     "substitutionMinute" INTEGER;

-- AddForeignKey
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_substitutedBy_fkey" FOREIGN KEY ("substitutedBy") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
